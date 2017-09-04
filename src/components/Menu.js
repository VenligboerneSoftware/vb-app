import {
	Alert,
	AsyncStorage,
	FlatList,
	I18nManager,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import Expo, { WebBrowser } from 'expo';
import React from 'react';
import firebase from 'firebase';

import { FontAwesome } from '@expo/vector-icons';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';

import { attemptLoginWithStoredToken } from '../utils/fbLogin';
import { getCode } from '../utils/languages';
import { translate } from '../utils/internationalization';
import history from '../utils/history.js';

export default class Menu extends React.Component {
	constructor() {
		super();
	}

	_afterLogin = async token => {
		const valid = await attemptLoginWithStoredToken(token, this._afterLogin);

		if (valid !== null) {
			let userProfile = firebase.auth().currentUser;
			// Initialize Amplitude with user data
			Expo.Amplitude.setUserId(userProfile.uid);
			Expo.Amplitude.setUserProperties({
				displayName: userProfile.displayName,
				email: userProfile.email,
				photoURL: userProfile.photoURL
			});

			// Preload Profile Pic
			Image.prefetch(
				'https://graph.facebook.com/' +
					firebase.auth().currentUser.providerData[0].uid +
					'/picture?height=400'
			);

			history.push('/HomePage', {});
		}
	};

	_logout = async () => {
		await AsyncStorage.removeItem('token');
		const agreedToEula = await AsyncStorage.getItem('eula');
		// Remove their pushToken
		firebase
			.database()
			.ref('users')
			.child(firebase.auth().currentUser.uid)
			.child('pushToken')
			.remove();
		history.push('/FacebookAuth', {
			//TODO: fix login and switch to me tab loading old data
			onDone: async token => {
				this._afterLogin(token);
			},
			eula: !agreedToEula
		});
	};

	_getLocalizedWiki = () =>
		'http://venligboerne.dk' +
		(getCode(global.language) === 'en' ? '' : '/' + getCode(global.language));

	_layoutAlert = () => {
		Alert.alert(
			global.isRTL
				? translate('Would you like to switch to LTR mode?')
				: translate('Would you like to switch to RTL mode?'),
			global.isRTL
				? translate(
						'The LTR format is made for languages written from left to right, such as Danish and English'
					)
				: translate(
						'The RTL format is made for languages written from right to left, such as Arabic and Persian'
					),
			[
				{
					text: translate('No')
				},
				{
					text: translate('Yes'),
					onPress: () => {
						global.isRTL ? this._setRTL(false) : this._setRTL(true);
					}
				}
			],
			{ cancelable: true }
		);
	};

	_setRTL = value => {
		global.isRTL = value;
		I18nManager.forceRTL(value);
		if (value !== I18nManager.isRTL) {
			alert(
				translate('Please quit and restart the app to see the layout changes')
			);
		}
	};

	render() {
		return (
			<View style={{ flex: 1 }}>
				<TouchableOpacity
					style={styles.tapCloseMenu}
					onPress={this.props.hide}
				/>
				<View style={styles.modalContainer}>
					<TouchableOpacity
						style={{ alignSelf: 'flex-end', marginRight: 10, marginTop: 10 }}
						onPress={this.props.hide}
					>
						<FontAwesome name={'times'} size={45} />
					</TouchableOpacity>

					<FlatList
						data={[
							{
								key: 'About Venligboerne',
								onPress: () =>
									WebBrowser.openBrowserAsync(this._getLocalizedWiki())
							},
							{
								key: 'Manage Notifications',
								onPress: () => {
									this.props.hide();
									global.setCurrentModal('/ManageNotifications');
								}
							},
							{
								key: 'Tutorial',
								onPress: () => history.push('/Tutorial')
							},

							{
								key: 'Photos',
								onPress: () =>
									WebBrowser.openBrowserAsync(
										this._getLocalizedWiki() + '/instagram'
									)
							},
							{
								key: 'FAQ About Denmark',
								onPress: () =>
									WebBrowser.openBrowserAsync(
										this._getLocalizedWiki() + '/knowledge-base/'
									)
							},
							{
								key: 'Give Feedback',
								onPress: () =>
									WebBrowser.openBrowserAsync(
										this._getLocalizedWiki() + '/feedback'
									)
							},
							{
								key: 'App Layout',
								onPress: this._layoutAlert
							},
							{
								key: 'Logout',
								onPress: this._logout
							}
						]}
						scrollEnabled={true}
						renderItem={({ item }) =>
							<View style={{ width: '100%' }}>
								<TouchableOpacity onPress={item.onPress}>
									<Text style={styles.menuText}>
										{translate(item.key)}
									</Text>
								</TouchableOpacity>
								<View style={SharedStyles.divider} />
							</View>}
					/>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	modalContainer: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		width: '60%',
		backgroundColor: '#F5F5F5',
		borderRightWidth: 1,
		borderColor: '#000',
		alignItems: 'center'
	},
	menuText: {
		fontSize: 20,
		textAlign: 'center',
		padding: 15,
		color: '#444'
	},
	tapCloseMenu: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		right: 0,
		width: '40%'
	}
});
