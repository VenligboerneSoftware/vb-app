import {
	AsyncStorage,
	I18nManager,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import { WebBrowser } from 'expo';
import React from 'react';
import firebase from 'firebase';

import { FontAwesome } from '@expo/vector-icons';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';

import { getCode } from '../utils/languages';
import { translate } from '../utils/internationalization';
import history from '../utils/history.js';

export default class Menu extends React.Component {
	constructor() {
		super();

		this.state = { isRTL: global.isRTL };
	}

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
			onDone: history.push.bind(this, '/HomePage', {}),
			eula: !agreedToEula
		});
	};

	_getLocalizedWiki = () =>
		'http://venligboerne.dk' +
		(getCode(global.language) === 'en' ? '' : '/' + getCode(global.language));

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

					{[
						{
							title: 'About Venligboerne',
							onPress: () =>
								WebBrowser.openBrowserAsync(this._getLocalizedWiki())
						},
						{
							title: 'Manage Notifications',
							onPress: () => {
								this.props.hide();
								global.setCurrentModal('/ManageNotifications');
							}
						},
						{
							title: 'Tutorial',
							onPress: () => history.push('/Tutorial')
						},

						{
							title: 'Photos',
							onPress: () =>
								WebBrowser.openBrowserAsync(
									this._getLocalizedWiki() + '/instagram'
								)
						},
						{
							title: 'FAQ About Denmark',
							onPress: () =>
								WebBrowser.openBrowserAsync(
									this._getLocalizedWiki() + '/knowledge-base/'
								)
						},
						{
							title: 'Give Feedback',
							onPress: () =>
								WebBrowser.openBrowserAsync(
									this._getLocalizedWiki() + '/feedback'
								)
						},
						{
							title: 'Logout',
							onPress: this._logout
						}
					].map(button =>
						<View key={button.title} style={{ width: '100%' }}>
							<TouchableOpacity onPress={button.onPress}>
								<Text style={styles.menuText}>
									{translate(button.title)}
								</Text>
							</TouchableOpacity>
							<View style={SharedStyles.divider} />
						</View>
					)}
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-around'
						}}
					>
						<Text style={styles.menuText}>LTR</Text>
						<Switch
							value={this.state.isRTL}
							onValueChange={value => {
								global.isRTL = value;
								this.setState({ isRTL: value });
								I18nManager.forceRTL(value);
								if (value !== I18nManager.isRTL) {
									alert(
										translate(
											'Please restart the app to change the layout direction'
										)
									);
								}
							}}
						/>
						<Text style={styles.menuText}>RTL</Text>
					</View>
					<View style={SharedStyles.divider} />
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
