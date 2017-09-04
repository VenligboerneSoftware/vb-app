import {
	Alert,
	AppState,
	AsyncStorage,
	I18nManager,
	Image,
	NetInfo,
	StatusBar,
	Text,
	View,
	BackHandler
} from 'react-native';
import { Route, Router, Switch } from 'react-router-native';
import Expo, { Font, Location, Notifications, Permissions } from 'expo';
import React from 'react';
import StatusBarAlert from 'react-native-statusbar-alert';
import * as firebase from 'firebase';

import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';

import { attemptLoginWithStoredToken } from './src/utils/fbLogin';
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
console.ignoredYellowBox = ['Setting a timer', 'Warning:'];

export default class App extends React.Component {
	constructor() {
		super();
		this.state = {
			displayText: 'Starting Application',
			internetAlertVisible: false
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

	componentWillMount() {
		BackHandler.addEventListener('hardwareBackPress', () => true);
	}

	async componentDidMount() {
		console.log(Date.now(), 'Assets loading');
		this.addInternetEventListeners();

		Expo.Amplitude.initialize(APIKeys.Amplitude);
		Expo.Amplitude.logEvent('Startup');

		const language = await AsyncStorage.getItem('language');
		global.autotranslate = Boolean(await AsyncStorage.getItem('autotranslate'));
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
		BackHandler.removeEventListener('hardwareBackPress', () => true);
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

		this.setState({ displayText: 'Attempting Login' });
		const valid = await attemptLoginWithStoredToken(
			storedToken,
			this._afterLogin
		);

		if (agreedToEula && storedToken && valid !== null) {
			this._afterLogin(storedToken);
		} else {
			history.push('/FacebookAuth', {
				onDone: this._afterLogin,
				eula: !agreedToEula
			});
		}
	};

	_afterLogin = async token => {
		console.log('Logged in');

		this._loadCenters();

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
				//temporary fix
				global.location = await Promise.race([
					new Promise(resolver => {
						setTimeout(resolver, 3000, null);
					}),
					Location.getCurrentPositionAsync({})
				]);
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

		this.assetPromises.fonts = Font.loadAsync([
			Ionicons.font,
			FontAwesome.font,
			Entypo.font,
			{
				Georgia: require('venligboerneapp/assets/fonts/Georgia.ttf')
			}
		]);
	};

	_loadCenters = () => {
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
	};

	addInternetEventListeners = () => {
		NetInfo.isConnected.addEventListener(
			'change',
			this._handleConnectivityChange
		);

		AppState.addEventListener('change', state => {
			console.log('App state', state);
			NetInfo.isConnected.fetch().then(this._handleConnectivityChange);
		});
	};

	_handleConnectivityChange = isConnected => {
		console.log('connectivity change', isConnected);
		this.setState({
			internetAlertVisible: !isConnected
		});
	};

	render() {
		return (
			<View style={{ flex: 1 }}>
				<StatusBar barStyle="dark-content" />
				<StatusBarAlert
					visible={this.state.internetAlertVisible}
					message={translate('No Internet Connection')}
					backgroundColor="red"
					color="white"
				/>
				<View
					style={{
						flex: 1,
						marginTop: this.state.internetAlertVisible ? 0 : -20
					}}
				>
					<Router history={history} style={{ marginTop: 200 }}>
						<Switch>
							<Route
								path="/StartupPage"
								render={() =>
									<StartupPage displayText={this.state.displayText} />}
							/>
							<Route path="/HomePage" component={HomePage} />
							<Route path="/Tutorial" component={Tutorial} />
							<Route path="/FacebookAuth" component={FacebookAuth} />
							<Route
								path="/IntroLanguageSelect"
								component={IntroLanguageSelect}
							/>
						</Switch>
					</Router>
				</View>
			</View>
		);
	}
}
