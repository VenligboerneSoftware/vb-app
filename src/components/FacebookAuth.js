import {
	Alert,
	AsyncStorage,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import Exponent from 'expo';
import React from 'react';
import * as firebase from 'firebase';

import { FontAwesome } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';
import APIKeys from 'venligboerneapp/src/utils/APIKeys.js';

import Colors from '../styles/Colors';
import LanguageMenu from './LanguageMenu';
import history from '../utils/history.js';

export default class FacebookAuth extends React.Component {
	constructor(props) {
		super(props);
	}

	// Function: authenticate
	// ---------------------------------------------------------------------------
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

	/* Function: attemptRegularLogin
     * ---------------------------------------------------------------------------
     * Attempts to log in a user to the app using the Facebook Graph API
     * and deals with potential login failures. Uses firebase authentication.
    */
	login = async () => {
		const options = {
			permissions: ['public_profile', 'email'],
			behavior: 'web'
		};
		const APP_ID = APIKeys.API_KEY;

		try {
			const {
				type,
				token
			} = await Exponent.Facebook.logInWithReadPermissionsAsync(
				APP_ID,
				options
			);

			if (type === 'success') {
				/* Next two lines in tutorial but not strictly neccessary -- can possibly use to make sure token is valid?
             If following calls are omitted, no calls to facebook server will
             occur and token will expire after 60 days  */

				// const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`)
				// const profile = await response.json()
				await AsyncStorage.setItem('token', token);
				history.goBack();
			} else if (type === 'cancel') {
				// Don't let the user close it
			} else {
				// error with logInWithReadPermissionsAsync call
				Alert.alert('fail #1', type);
			}
		} catch (e) {
			// all other errors signInWithCredential call
			Alert.alert('fail #2', e.toString());
		}
	};

	render() {
		return (
			<View style={styles.container}>
				<Image
					source={require('../../assets/images/logo_black_text.png')}
					style={styles.logo}
				/>
				<View style={styles.textContainer}>
					<Text style={styles.text}>
						{translate(
							'In order to use the app, you must log in to Facebook for security reasons.  Your Facebook profile and information will only be visible to the people you choose to show it to. If you apply to an event, your profile will be visible to the event owner. If someone applies to your event, once you accept their application they will be able to see your profile.'
						)}
					</Text>
				</View>
				<TouchableOpacity onPress={this.login} style={styles.buttonContainer}>
					<FontAwesome
						name={'facebook'}
						size={40}
						style={styles.facebookIcon}
					/>
					<Text style={styles.loginButton}>
						{translate('LOG IN WITH FACEBOOK')}
					</Text>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: 'white'
	},
	textContainer: {
		flex: 2,
		padding: 15,
		justifyContent: 'center'
	},
	text: {
		fontSize: 18,
		textAlign: 'left'
	},
	buttonContainer: {
		backgroundColor: '#3b5998',
		justifyContent: 'space-around',
		margin: 25,
		borderRadius: 6,
		flexDirection: 'row',
		alignItems: 'center'
	},
	loginButton: {
		color: 'white',
		fontSize: 18,
		textAlign: 'center',
		backgroundColor: 'transparent'
	},
	facebookIcon: {
		color: 'white',
		margin: 10
	},
	logo: {
		width: '85%',
		flex: 1,
		resizeMode: 'contain',
		alignSelf: 'center',
		marginTop: 75
	}
});
