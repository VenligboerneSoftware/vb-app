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

import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';

import { setLanguage } from './src/utils/internationalization';
import APIKeys from './src/utils/APIKeys.js';
import FacebookAuth from './src/components/FacebookAuth.js';
import HomePage from './src/components/HomePage.js';
import LanguageSelect from './src/components/IntroLanguageSelect.js';
import StartupPage from './src/components/StartupPage';
import Tutorial from './src/components/Tutorial.js';
import history from './src/utils/history';

// The warnings are caused by an issue in Firebase. Hopefully a future firebase
// update will fix them.
console.ignoredYellowBox = ['Setting a timer'];

export default class App extends React.Component {
	constructor() {
		super();
		this.state = { startupStage: 'AppLoading' };
		console.log(Date.now(), 'Entering App.js');

		// Disallows font scaling on iOS
		Text.defaultProps.allowFontScaling = false;

		// Initialize firebase before we do anything else
		firebase.initializeApp(APIKeys.firebaseConfig);

		I18nManager.allowRTL(true);

		this.assetPromises = {};
		global.db = {
			categories: {},
			centers: {},
			posts: {},
			language: {},
			languageOptions: {}
		};
	}

	async componentDidMount() {
		this._startAssetLoad(); // TODO do this sooner
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
		userProfile = JSON.parse(JSON.stringify(userProfile));
		userProfile.language = global.language;
		Expo.Amplitude.setUserId(userProfile.uid);
		Expo.Amplitude.setUserProperties(userProfile);

		// Add the users push token to the database so they can be notified about events.
		// Get the token that uniquely identifies this device.
		Notifications.getExpoPushTokenAsync().then(pushToken => {
			// Store user data in the database
			firebase.database().ref('users').child(userProfile.uid).update({
				facebookUID: userProfile.providerData[0].uid,
				photoURL: userProfile.providerData[0].photoURL,
				pushToken: pushToken,
				displayName: userProfile.providerData[0].displayName
			});
		});

		// Preload Profile Pic
		Image.prefetch(
			'https://graph.facebook.com/' +
				firebase.auth().currentUser.providerData[0].uid +
				'/picture?height=400'
		);

		if (this.isFirstTime) {
			history.push('/Tutorial');
		} else {
			let { status } = await Permissions.askAsync(Permissions.LOCATION);
			if (status === 'granted') {
				global.location = await Location.getCurrentPositionAsync({});
			}

			// When login succeeds and the databse is loaded, proceed to the homepage
			await Promise.all([
				this.assetPromises.categories,
				this.assetPromises.centers
			]);
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
		this.setState({ displayText: 'Loading Language Info' });
		this.assetPromises.language = firebase
			.database()
			.ref('language')
			.once('value')
			.then(snap => {
				global.db.language = snap.val();
				console.log('Loaded language');
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

		// Preload all of the images for icons and pins so they don't lag later.
		// Note: Only works on hardware devices, not emulators.
		this.setState({ displayText: 'Loading Icons' });
		this.assetPromises.categories = firebase
			.database()
			.ref('categories')
			.once('value')
			.then(function(snap) {
				global.db.categories = snap.val();
				for (const iconName in global.db.categories) {
					let icon = global.db.categories[iconName];
					Image.prefetch(icon.iconURL);
					Image.prefetch(icon.pinURL);
					icon.key = iconName;
				}
				console.log('Loaded icons');
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

		this.setState({ displayText: 'Loading Fonts' });
		this.assetPromises.fonts = Font.loadAsync([
			Ionicons.font,
			FontAwesome.font,
			{
				Georgia: require('venligboerneapp/assets/fonts/Georgia.ttf')
			}
		]);

		// TODO how do I catch this?
		// console.warn('Database load error', error);
		// if (error.code === 'PERMISSION_DENIED') {
		// 	alert(
		// 		'You have been banned by an administrator for inappropriate use of the app. Please email venligboerneapp@gmail.com for more details.'
		// 	);
		// }
		// return;
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
		if (this.state.isLoading) {
			// Can't display loading text and works on iOS only
			// return <AppLoading />;
			return <StartupPage displayText={this.state.displayText} />;
		}

		return (
			<Router history={history}>
				<Switch>
					<Route path="/HomePage" component={HomePage} />
					<Route path="/Tutorial" component={Tutorial} />
					<Route path="/FacebookAuth" component={FacebookAuth} />
					<Route path="/StartupPage" component={StartupPage} />
					<Route path="/IntroLanguageSelect" component={LanguageSelect} />
				</Switch>
			</Router>
		);
	}
}
