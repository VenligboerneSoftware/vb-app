import { Alert, I18nManager, NetInfo, Text } from 'react-native';
import { Router, Route, Switch } from 'react-router-native';
import React from 'react';
import * as firebase from 'firebase';

import { translate } from 'venligboerneapp/src/utils/internationalization.js';

import APIKeys from './src/utils/APIKeys.js';
import FacebookAuth from './src/components/FacebookAuth.js';
import HomePage from './src/components/HomePage.js';
import LanguageSelect from './src/components/IntroLanguageSelect.js';
import StartupPage from './src/components/StartupPage.js';
import Tutorial from './src/components/Tutorial.js';
import history from './src/utils/history.js';

// The warnings are caused by an issue in Firebase. Hopefully a future firebase
// update will fix them.
console.ignoredYellowBox = ['Setting a timer'];

export default class App extends React.Component {
	constructor() {
		super();
	}

	componentWillMount() {
		// Disallows font scaling on iOS
		Text.defaultProps.allowFontScaling = false;

		// Initialize firebase before we do anything else
		firebase.initializeApp(APIKeys.firebaseConfig);

		I18nManager.allowRTL(true);
	}

	componentDidMount() {
		this.addInternetEventListeners();
	}

	componentWillUnmount() {
		NetInfo.isConnected.removeEventListener(
			'change',
			this._handleConnectionChange
		);
	}

	addInternetEventListeners() {
		NetInfo.isConnected.addEventListener(
			'change',
			this._handleConnectivityChange
		);
		// This must be called after you add the listener due to a bug in NetInfo
		// https://github.com/facebook/react-native/issues/8615
		NetInfo.isConnected.fetch().then(isConnected => {
			console.log('First, is ' + (isConnected ? 'online' : 'offline'));
		});
	}

	_handleConnectivityChange(isConnected) {
		if (!isConnected) {
			Alert.alert(
				translate('Internet Connection Error'),
				translate(
					'You are not connected to the internet.  Please Reconnect to the internet to use the app'
				),
				[{ text: translate('OK'), onPress: () => console.log('OK Pressed') }],
				{ cancelable: false }
			);
		}
		console.log('Then, is ' + (isConnected ? 'online' : 'offline'));
	}

	render() {
		return (
			<Router history={history}>
				<Switch>
					<Route path="/homepage" component={HomePage} />
					<Route path="/tutorial" component={Tutorial} />
					<Route path="/facebook" component={FacebookAuth} />
					<Route path="/startup" component={StartupPage} />
					<Route path="/introLanguageSelect" component={LanguageSelect} />
				</Switch>
			</Router>
		);
	}
}
