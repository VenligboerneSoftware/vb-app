import { Notifications, Font } from 'expo';
import { View, Image, StyleSheet, AsyncStorage, Alert } from 'react-native';
import * as Progress from 'react-native-progress';
import React from 'react';
import * as firebase from 'firebase';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

import history from '../utils/history.js';

export default class StartupPage extends React.Component {
	constructor(props) {
		super(props);

		global.db = {
			categories: {},
			centers: {},
			posts: {}
		};
	}

	_loadDatabasePromises = async () => {
		// Preload all of the images for icons and pins so they don't lag later.
		// Note: Only works on hardware devices, not emulators.
		const iconPromise = firebase
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
		const centerPromise = firebase
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

		// This promise will only resolve when all the data is loaded
		await Promise.all([iconPromise, centerPromise]);
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

	attemptLoginWithStoredToken = async token => {
		// TODO: Make sure all invalid token handling covered

		// TODO: refresh token implementation
		// possibly helpful: https://developers.facebook.com/docs/facebook-login/access-tokens/debugging-and-error-handling

		try {
			let userProfile = await this.authenticate(token);
			global.token = token;

			// Add the users push token to the database so they can be notified about events.
			// Get the token that uniquely identifies this device.
			const pushToken = await Notifications.getExpoPushTokenAsync();

			// Store user data in the database
			firebase.database().ref('users').child(userProfile.uid).update({
				facebookUID: userProfile.providerData[0].uid,
				photoURL: userProfile.providerData[0].photoURL,
				pushToken: pushToken,
				displayName: userProfile.providerData[0].displayName
			});
		} catch (error) {
			console.error(error);
			AsyncStorage.removeItem('token');
			Alert.alert('Your Facebook session has expired!', 'Please log in again!');
			history.push('/facebook');
		}
	};

	async componentDidMount() {
		global.language = await AsyncStorage.getItem('language');
		const storedToken = await AsyncStorage.getItem('token');

		// Language data must be loaded before language selection page
		global.db.language = (await firebase
			.database()
			.ref('language')
			.once('value')).val();
		global.db.languageOptions = (await firebase
			.database()
			.ref('languageOptions')
			.once('value')).val();
		Object.values(global.db.languageOptions).forEach(language => {
			Image.prefetch(language.flag);
		});
		console.log('Loaded language');

		Font.loadAsync([
			Ionicons.font,
			FontAwesome.font,
			{
				Georgia: require('venligboerneapp/assets/fonts/Georgia.ttf')
			}
		]);
		console.log('Loaded fonts');

		if (!global.language) {
			global.isFirstTime = true;
			history.push('/introLanguageSelect');
		} else if (!storedToken) {
			history.push('/facebook');
		} else {
			await this.attemptLoginWithStoredToken(storedToken);

			Image.prefetch(
				'https://graph.facebook.com/' +
					firebase.auth().currentUser.providerData[0].uid +
					'/picture?height=400'
			); //Preload Profile Pic

			await this._loadDatabasePromises();

			if (global.isFirstTime) {
				history.push('/tutorial');
			} else {
				// When login succeeds and the databse is loaded, proceed to the homepage
				history.push('/homepage');
			}
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<Image
					source={require('../../assets/images/home_gradient.png')}
					style={styles.gradient}
				>
					<Image
						source={require('../../assets/images/logo.png')}
						style={styles.logo}
					/>

					<View style={styles.loadingCircle}>
						<Progress.Circle
							size={60}
							indeterminate={true}
							color={'rgba(255, 255, 255, 0.3)'}
							thickness={100}
						/>
					</View>
				</Image>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
		height: '100%',
		backgroundColor: 'transparent',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	loadingCircle: {
		width: '95%',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent'
	},
	logo: {
		width: '85%',
		flex: 3.5,
		resizeMode: 'contain',
		alignSelf: 'center'
	},
	gradient: {
		width: '100%',
		height: '100%'
	}
});
