import {
	AsyncStorage,
	I18nManager,
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
		history.push('/startup');
	};

	_showModal = () => this.setState({ manageNotificationsModal: true });

	_hideModal = () => this.setState({ manageNotificationsModal: false });

	_getLocalizedWiki = () =>
		'http://venligboerne.dk' +
		(getCode(global.language) === 'en' ? '' : '/' + getCode(global.language));

	render() {
		return (
			<View style={styles.container}>
				<Modal
					isVisible={this.state.manageNotificationsModal}
					animationIn={'zoomIn'}
					animationOut={'zoomOut'}
				>
					<ManageNotifications hide={this._hideModal} />
				</Modal>

				{/*Manage Notifications*/}
				<TouchableOpacity onPress={this._showModal}>
					<Text style={[styles.menuText]}>
						{translate('Manage Notifications')}
					</Text>
				</TouchableOpacity>

				<View style={SharedStyles.divider} />

				{/*About Venligboerne*/}
				<TouchableOpacity>
					<Text
						style={styles.menuText}
						onPress={() =>
							WebBrowser.openBrowserAsync(this._getLocalizedWiki())}
					>
						{translate('About Venligboerne')}
					</Text>
				</TouchableOpacity>

				<View style={SharedStyles.divider} />

				{/*Knowledge Base Link*/}
				<TouchableOpacity
					onPress={() =>
						WebBrowser.openBrowserAsync(
							this._getLocalizedWiki() + '/knowledge-base/'
						)}
				>
					<Text style={styles.menuText}>
						{translate('FAQ About Denmark')}
					</Text>
				</TouchableOpacity>

				{/* <View style={SharedStyles.divider} />

				TODO Donate
				<TouchableOpacity>
					<Text style={styles.menuText}>
						{translate('Donate')}
					</Text>
				</TouchableOpacity> */}

				<View style={SharedStyles.divider} />

				{/*Logout*/}
				<TouchableOpacity onPress={this._logout}>
					<Text style={styles.menuText}>
						{translate('Logout')}
					</Text>
				</TouchableOpacity>

				<View style={SharedStyles.divider} />

				{/*Feedback Button*/}
				<TouchableOpacity
					onPress={() =>
						WebBrowser.openBrowserAsync(this._getLocalizedWiki() + '/feedback')}
				>
					<Text style={styles.menuText}>
						{translate('Give Feedback')}
					</Text>
				</TouchableOpacity>

				<View style={SharedStyles.divider} />

				{/* Tutorial */}
				<TouchableOpacity onPress={() => history.push('/tutorial')}>
					<Text style={styles.menuText}>
						{translate('Tutorial')}
					</Text>
				</TouchableOpacity>

				<View style={SharedStyles.divider} />

				<TouchableOpacity
					style={{ position: 'absolute', bottom: 0, left: 0, padding: 30 }}
					onPress={this.props.hide}
				>
					<FontAwesome
						name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
						size={40}
					/>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
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
	}
});
