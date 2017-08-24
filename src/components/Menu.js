import {
	AsyncStorage,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import { WebBrowser } from 'expo';
import Modal from 'react-native-modal';
import React from 'react';

import { FontAwesome } from '@expo/vector-icons';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';

import { getCode } from '../utils/languages';
import { translate } from '../utils/internationalization';
import ManageNotifications from './ManageNotifications';
import history from '../utils/history.js';

export default class Menu extends React.Component {
	constructor() {
		super();

		this.state = {
			manageNotificationsModal: false
		};
	}

	_logout = async () => {
		await AsyncStorage.removeItem('token');
		const agreedToEula = await AsyncStorage.getItem('eula');
		history.push('/FacebookAuth', {
			onDone: history.push.bind(this, '/HomePage', {}),
			eula: !agreedToEula
		});
	};

	_showModal = () => this.setState({ manageNotificationsModal: true });

	_hideModal = () => this.setState({ manageNotificationsModal: false });

	_getLocalizedWiki = () =>
		'http://venligboerne.dk' +
		(getCode(global.language) === 'en' ? '' : '/' + getCode(global.language));

	render() {
		return (
			<View style={{ flex: 1 }}>
				<TouchableOpacity
					style={styles.tapCloseMenu}
					onPress={this.manageNotificationsModal ? null : this.props.hide}
				/>
				<View style={styles.modalContainer}>
					<Modal
						isVisible={this.state.manageNotificationsModal}
						animationIn={'zoomIn'}
						animationOut={'zoomOut'}
					>
						<ManageNotifications hide={this._hideModal} />
					</Modal>

					<TouchableOpacity
						style={{ alignSelf: 'flex-end', marginRight: 10, marginTop: 10 }}
						onPress={this.props.hide}
					>
						<FontAwesome name={'times'} size={45} />
					</TouchableOpacity>

					{[
						{
							title: 'Manage Notifications',
							onPress: this._showModal
						},
						{
							title: 'About Venligboerne',
							onPress: () =>
								WebBrowser.openBrowserAsync(this._getLocalizedWiki())
						},
						{
							title: 'FAQ About Denmark',
							onPress: () =>
								WebBrowser.openBrowserAsync(
									this._getLocalizedWiki() + '/knowledge-base/'
								)
						},
						{
							title: 'Logout',
							onPress: this._logout
						},
						{
							title: 'Give Feedback',
							onPress: () =>
								WebBrowser.openBrowserAsync(
									this._getLocalizedWiki() + '/feedback'
								)
						},
						{
							title: 'Tutorial',
							onPress: () => history.push('/Tutorial')
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
