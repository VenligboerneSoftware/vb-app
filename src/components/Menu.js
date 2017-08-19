import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	AsyncStorage
} from 'react-native';
import { WebBrowser } from 'expo';
import Modal from 'react-native-modal';
import React from 'react';

import { FontAwesome } from '@expo/vector-icons';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';

import { getLanguageSymbol, translate } from '../utils/internationalization';
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

				<TouchableOpacity
					style={{ alignSelf: 'flex-end', marginRight: 10 }}
					onPress={() => global.closeMenu()}
				>
					<FontAwesome name={'times'} size={35} />
				</TouchableOpacity>

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
							WebBrowser.openBrowserAsync('http://venligboerne.dk/')} //TODO: add language symbol
					>
						{translate('About Venligboerne')}
					</Text>
				</TouchableOpacity>

				<View style={SharedStyles.divider} />

				{/*Knowledge Base Link*/}
				<TouchableOpacity
					onPress={() =>
						WebBrowser.openBrowserAsync(
							'http://venligboerne.dk/' +
								getLanguageSymbol() +
								'/knowledge-base/'
						)}
				>
					<Text style={styles.menuText}>
						{translate('FAQ About Denmark')}
					</Text>
				</TouchableOpacity>

				<View style={SharedStyles.divider} />

				{/*TODO Donate*/}
				{/* <TouchableOpacity>
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
						WebBrowser.openBrowserAsync(
							'http://venligboerne.dk/' + getLanguageSymbol() + '/feedback'
						)}
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
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5F5F5',
		borderWidth: 1,
		borderColor: '#000',
		alignItems: 'center',
		paddingTop: 20
	},
	menuText: {
		fontSize: 20,
		textAlign: 'center',
		padding: 15,
		color: '#444'
	}
});
