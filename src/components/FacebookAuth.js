import {
	Alert,
	AsyncStorage,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import Exponent, { WebBrowser } from 'expo';
import Modal from 'react-native-modal';
import React from 'react';
import * as firebase from 'firebase';

import { FontAwesome } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';
import APIKeys from 'venligboerneapp/src/utils/APIKeys.js';

import Colors from '../styles/Colors';
import ExitBar from './ExitBar';
import history from '../utils/history';

export default class FacebookAuth extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			eulaClicked: false,
			isModalVisible: false
		};
		this.eula = this.props.location.state.eula;
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

	_eulaAlert = () => {
		Alert.alert(
			translate('Please agree to the End User Licensing Agreement'),
			translate('You must agree before you can log in'),
			[{ text: translate('Ok') }],
			{ cancelable: false }
		);
	};
	/* Function: attemptRegularLogin
     * ---------------------------------------------------------------------------
     * Attempts to log in a user to the app using the Facebook Graph API
     * and deals with potential login failures. Uses firebase authentication.
    */
	login = async () => {
		if (this.eula && !this.state.eulaClicked) {
			this._eulaAlert();
		} else {
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
					history.push('/StartupPage');
					await AsyncStorage.setItem('token', token);
					if (this.eula) {
						await AsyncStorage.setItem('eula', 'true');
					}

					this.props.location.state.onDone(token);
				} else if (type === 'cancel') {
					// Don't let the user close it
				} else {
					// error with logInWithReadPermissionsAsync call
					// TODO better error messages
					Alert.alert('ERROR #1', type);
				}
			} catch (e) {
				// all other errors signInWithCredential call
				Alert.alert('ERROR #2', e.toString());
			}
		}
	};

	render() {
		return (
			<View style={styles.container}>
				<Image
					source={require('../../assets/images/logo_gray_text.png')}
					style={styles.logo}
				/>

				{this.eula
					? <View style={{ flexDirection: 'row', paddingBottom: 40 }}>
							<View style={{ flex: 1 }}>
								<TouchableOpacity
									style={
										this.state.eulaClicked
											? styles.checkbox
											: styles.agreeButton
									}
									onPress={() =>
										this.setState({ eulaClicked: !this.state.eulaClicked })}
								>
									{this.state.eulaClicked
										? <FontAwesome
												name={'check'}
												size={30}
												style={{ paddingLeft: 5 }}
											/>
										: <Text style={{ fontSize: 16 }}>
												{translate('I Agree')}
											</Text>}
								</TouchableOpacity>
							</View>
							<View style={styles.textContainer}>
								<Text>
									{translate('I agree to the')}
								</Text>
								<TouchableOpacity
									onPress={() => {
										WebBrowser.openBrowserAsync(
											'http://venligboerne-app.herokuapp.com/eula'
										);
									}}
								>
									<Text style={{ textDecorationLine: 'underline' }}>
										End User Licencing Agreement
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					: null}

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

				<TouchableOpacity
					style={{ flex: 1, justifyContent: 'center' }}
					onPress={() => {
						this.setState({ isModalVisible: true });
					}}
				>
					<Text style={styles.text}>
						{translate('Why Log In?')}
					</Text>
				</TouchableOpacity>

				<Modal
					isVisible={this.state.isModalVisible}
					animationIn={'zoomIn'}
					animationOut={'zoomOut'}
				>
					<View style={{ flex: 1, backgroundColor: 'white' }}>
						<ExitBar
							hide={() => {
								this.setState({ isModalVisible: false });
							}}
						/>
						<Text
							style={{
								alignSelf: 'center',
								fontSize: 24,
								margin: 20,
								fontWeight: 'bold'
							}}
						>
							{translate('Why Log In?')}
						</Text>
						<Text
							style={{
								marginLeft: 25,
								marginRight: 25,
								fontSize: 18,
								alignSelf: 'center'
							}}
						>
							{translate(
								'In order to create or reply to posts, you must log in to Facebook for security reasons.  Your Facebook profile and information will only be visible to the people you choose to show it to. If you reply to an post, your profile will be visible to the post owner. If someone responds to your event, once you accept, they will be able to see your profile.'
							)}
						</Text>
					</View>
				</Modal>
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
	text: {
		fontSize: 18,
		alignSelf: 'center',
		textDecorationLine: 'underline'
	},
	buttonContainer: {
		backgroundColor: '#3b5998',
		justifyContent: 'space-around',
		margin: 25,
		borderRadius: 6,
		flexDirection: 'row',
		alignItems: 'center',
		height: 70
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
		flex: 2,
		resizeMode: 'contain',
		alignSelf: 'center',
		marginTop: 40,
		marginBottom: 40
	},
	textContainer: {
		justifyContent: 'center',
		flex: 2
	},
	checkbox: {
		width: 40,
		height: 40,
		backgroundColor: Colors.grey.medium,
		alignSelf: 'center',
		justifyContent: 'center'
	},
	agreeButton: {
		backgroundColor: Colors.grey.medium,
		padding: 10,
		alignSelf: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		borderRadius: 10
	}
});
