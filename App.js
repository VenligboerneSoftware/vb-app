import {
	Alert,
	AsyncStorage,
	I18nManager,
	Image,
	NetInfo,
	Text
} from 'react-native';
import { Route, Router, Switch } from 'react-router-native';
import Expo, { Font, Location, Notifications, Permissions } from 'expo';
import React from 'react';
import * as firebase from 'firebase';

import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';

import { setLanguage } from './src/utils/internationalization';
import APIKeys from './src/utils/APIKeys.js';
import FacebookAuth from './src/components/FacebookAuth.js';
import HomePage from './src/components/HomePage.js';
import IntroLanguageSelect from './src/components/IntroLanguageSelect.js';
import StartupPage from './src/components/StartupPage';
import Tutorial from './src/components/Tutorial.js';
import history from './src/utils/history';

// The warnings are caused by an issue in Firebase. Hopefully a future firebase
// update will fix them.
console.ignoredYellowBox = ['Setting a timer'];

export default class App extends React.Component {
	constructor() {
		super();
		this.state = {
			displayText: 'Starting Application'
		};
		console.log(Date.now(), 'Entering App.js');
		this.assetPromises = {};
		global.db = {};

		// Initialize firebase before we do anything else
		firebase.initializeApp(APIKeys.firebaseConfig);
		this._startAssetLoad();

		// Disallows font scaling on iOS
		Text.defaultProps.allowFontScaling = false;

		I18nManager.allowRTL(true);

		history.push('/StartupPage');
	}

	async componentDidMount() {
		console.log(Date.now(), 'Assets loading');
		this.addInternetEventListeners();

		Expo.Amplitude.initialize(APIKeys.Amplitude);
		Expo.Amplitude.logEvent('Startup');

		const language = await AsyncStorage.getItem('language');
		await Promise.all([
			this.assetPromises.language,
			this.assetPromises.languageOptions
		]);
		if (language) {
			this.isFirstTime = false;
			this._afterLanguageSelect(language);
		} else {
			this.isFirstTime = true;

			// Check if we support the system language. If so, use it automatically.
			// TODO should we just always prompt the user?
			Expo.Util.getCurrentLocaleAsync().then(locale => {
				locale = locale.split('_')[0]; // Only get the language component
				Object.values(global.db.languageOptions).forEach(lang => {
					if (lang.code === locale) {
						console.log('Automatically setting language to', lang);
						setLanguage(lang.name);
						this._afterLanguageSelect(lang.name);
					}
				});

				// Ask the user if their system language is not supported
				history.push('/IntroLanguageSelect', {
					onDone: this._afterLanguageSelect
				});
			});
		}
	}

	componentWillUnmount() {
		NetInfo.isConnected.removeEventListener(
			'change',
			this._handleConnectionChange
		);
	}

	firstTimeLocationAlert = async => {
		Alert.alert(
			translate('Enable Location Services'),
			translate(
				'The app will ask to use your location. Your location will not be stored and will be used to help you find posts nearby you.'
			),
			[
				{
					text: translate('Ok'),
					onPress: async () => {
						let { status } = await Permissions.askAsync(Permissions.LOCATION);
						if (status === 'granted') {
							global.location = await Location.getCurrentPositionAsync({});
						}
					}
				}
			],
			{ cancelable: false }
		);
	};

	_afterLanguageSelect = async language => {
		global.language = language;
		const storedToken = await AsyncStorage.getItem('token');
		const agreedToEula = await AsyncStorage.getItem('eula');
		if (agreedToEula && storedToken) {
			this._afterLogin(storedToken);
		} else {
			history.push('/FacebookAuth', {
				onDone: this._afterLogin,
				eula: !agreedToEula
			});
		}
	};

	_afterLogin = async token => {
		await this.attemptLoginWithStoredToken(token);
		console.log('Logged in');

		// Initialize Amplitude with user data
		let userProfile = firebase.auth().currentUser;

		Expo.Amplitude.setUserId(userProfile.uid);
		Expo.Amplitude.setUserProperties({
			displayName: userProfile.displayName,
			email: userProfile.email,
			photoURL: userProfile.photoURL
		});

		// Add the users push token to the database so they can be notified about events.
		// Get the token that uniquely identifies this device.
		Notifications.getExpoPushTokenAsync().then(async pushToken => {
			const userRef = firebase.database().ref('users').child(userProfile.uid);
			// Set default permissions to normal
			const permissions = await userRef.child('permissions').once('value');
			// Store user data in the database
			userRef.update({
				facebookUID: userProfile.providerData[0].uid,
				photoURL: userProfile.providerData[0].photoURL,
				pushToken: pushToken,
				displayName: userProfile.providerData[0].displayName,
				permissions: permissions.val() || 'normal'
			});
		});

		// Preload Profile Pic
		Image.prefetch(
			'https://graph.facebook.com/' +
				firebase.auth().currentUser.providerData[0].uid +
				'/picture?height=400'
		);

		if (this.isFirstTime) {
			this.firstTimeLocationAlert();
		} else {
			let { status } = await Permissions.askAsync(Permissions.LOCATION);
			if (status === 'granted') {
				global.location = await Location.getCurrentPositionAsync({});
			}
		}

		await Promise.all([
			this.assetPromises.categories,
			this.assetPromises.centers
		]);

		// When login succeeds and the database is loaded, proceed
		if (this.isFirstTime) {
			history.push('/Tutorial');
		} else {
			history.push('/HomePage');
		}
	};

	// Function: authenticate
	//-----------------------------------------------------------------------
	// Authenticates token with firebase server and returns
	// a firebase.promise (guaranteed to be an eventual value)
	// containing a non-null firebase user. Will throw an error
	// if token is invalid/malformed.
	//
	// More on a firebase.promise:
	// https://firebase.google.com/docs/reference/js/firebase.Promise#Promise
	authenticate = async token => {
		const provider = firebase.auth.FacebookAuthProvider;
		const credential = provider.credential(token);
		return await firebase.auth().signInWithCredential(credential);
	};

	// Function: attemptLoginWithStoredToken
	//------------------------------------------------
	// Tries to log into the user's account using a token
	// stored in local storage if available. Otherwise,
	// if token is invalid, deletes the user's token from
	// the database and redirects to a regular login.
	attemptLoginWithStoredToken = token => {
		// TODO Make sure all invalid token handling covered
		this.setState({ displayText: 'Attempting Login' });
		global.token = token;
		return this.authenticate(token).catch(error => {
			console.error('Facebook authentication error', error);
			AsyncStorage.removeItem('token');
			Alert.alert('Your Facebook session has expired!', 'Please log in again!');
			AsyncStorage.getItem('eula').then(agreedToEula => {
				history.push('/FacebookAuth', {
					onDone: this._afterLogin,
					eula: !agreedToEula
				});
			});
		});
	};

	_startAssetLoad = () => {
		// Language data must be loaded before language selection page
		this.assetPromises.language = firebase
			.database()
			.ref('language')
			.once('value')
			.then(snap => {
				global.db.language = snap.val();
				console.log('Loaded language');
				this.setState({ displayText: 'Loaded Language Info' });
			});

		this.assetPromises.languageOptions = firebase
			.database()
			.ref('languageOptions')
			.once('value')
			.then(snap => {
				global.db.languageOptions = snap.val();
				Object.values(global.db.languageOptions).forEach(language => {
					Image.prefetch(language.flag);
				});
				console.log('Loaded languageOptions');
			});

		this.assetPromises.categories = firebase
			.database()
			.ref('categories')
			.once('value')
			.then(snap => {
				global.db.categories = snap.val();
				for (const iconName in global.db.categories) {
					let icon = global.db.categories[iconName];
					// Preload all of the images for icons and pins so they don't lag later.
					// Note: Only works on hardware devices, not emulators.
					Image.prefetch(icon.iconURL);
					Image.prefetch(icon.pinURL);
					icon.key = iconName;
				}
				console.log('Loaded icons');
				this.setState({ displayText: 'Loaded Icons' });
			});

		// Queries firebase and downloads all center data from the firebase server.
		// Creates a vector of local centers to appear on initial render.
		this.assetPromises.centers = firebase
			.database()
			.ref('centers')
			.once('value')
			.then(centers => {
				global.db.centers = centers.val();
				for (const center in global.db.centers) {
					global.db.centers[center].key = center;
					global.db.centers[center].icon = 'center';
					global.db.centers[center].pinSrc = global.db.categories.center.pinURL;
				}
				console.log('Loaded centers');
			});

		this.assetPromises.fonts = Font.loadAsync([
			Ionicons.font,
			FontAwesome.font,
			Entypo.font,
			{
				Georgia: require('venligboerneapp/assets/fonts/Georgia.ttf')
			}
		]);
	};

	addInternetEventListeners = () => {
		NetInfo.isConnected.addEventListener(
			'change',
			this._handleConnectivityChange
		);
		// This must be called after you add the listener due to a bug in NetInfo
		// https://github.com/facebook/react-native/issues/8615
		// NetInfo.isConnected.fetch().then(isConnected => {
		// 	console.log('First, is ' + (isConnected ? 'online' : 'offline'));
		// });
	};

	_handleConnectivityChange = isConnected => {
		if (!isConnected) {
			Alert.alert(
				translate('Internet Connection Error'),
				translate(
					'You are not connected to the internet.  Please Reconnect to the internet to use the app'
				),
				[{ text: translate('OK') }],
				{ cancelable: false }
			);
		}
	};

	render() {
		return (
			<Router history={history}>
				<Switch>
					<Route
						path="/StartupPage"
						render={() => <StartupPage displayText={this.state.displayText} />}
					/>
					<Route path="/HomePage" component={HomePage} />
					<Route path="/Tutorial" component={Tutorial} />
					<Route path="/FacebookAuth" component={FacebookAuth} />
					<Route path="/IntroLanguageSelect" component={IntroLanguageSelect} />
				</Switch>
			</Router>
		);
	}
}
