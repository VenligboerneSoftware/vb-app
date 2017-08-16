import {
	FlatList,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import React, { Component } from 'react';
import Modal from 'react-native-modal';

import { Entypo } from '@expo/vector-icons';
import firebase from 'firebase';

import Colors from '../styles/Colors';
import ExitBar from './ExitBar';
import NewNotification from './NewNotification';

export default class ManageNotifications extends Component {
	constructor(props) {
		super(props);
		this.state = {
			subscriptions: null,
			newNotificationVisible: false
		};

		this._loadSubscriptions();
	}

	_loadSubscriptions = async () => {
		// let subscriptions = (await firebase
		// 	.database()
		// 	.ref('subscriptions')
		// 	.child('owner')
		// 	.equalTo(firebase.auth().currentUser)
		// 	.once('value')).val();
		//
		//TODO: FINISH
	};

	render() {
		return (
			<View style={styles.container}>
				<Modal
					isVisible={this.state.newNotificationVisible}
					animationIn={'zoomIn'}
					animationOut={'zoomOut'}
				>
					<NewNotification
						hide={() => this.setState({ newNotificationVisible: false })}
					/>
				</Modal>
				<ExitBar title={'Manage Notifications'} hide={this.props.hide} />
				<ScrollView
					ref={scrollView => {
						this.scrollView = scrollView;
					}}
				>
					<FlatList
						data={this.props.listData}
						scrollEnabled={false}
						ItemSeparatorComponent={() => <View style={SharedStyles.divider} />}
						renderItem={({ item }) =>
							<TouchableOpacity
								onPress={() => {
									this._showModal(item);
								}}
								style={styles.rowStyles}
							/>}
					/>
				</ScrollView>
				<View style={styles.bottomBar}>
					<TouchableOpacity
						style={styles.addCircle}
						onPress={() => this.setState({ newNotificationVisible: true })}
					>
						<Entypo name={'plus'} size={44} style={styles.addIcon} />
					</TouchableOpacity>
					<Text style={styles.bottomText}>Add Notification</Text>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: 'white'
	},
	bottomBar: {
		height: 70,
		width: '100%',
		backgroundColor: Colors.grey.light,
		borderColor: Colors.grey.medium,
		borderWidth: 1,
		justifyContent: 'center'
	},
	addCircle: {
		alignSelf: 'center',
		height: 50,
		width: 50,
		backgroundColor: Colors.blue.dark,
		borderRadius: 25,
		justifyContent: 'center'
	},
	addIcon: {
		color: 'white',
		backgroundColor: 'transparent',
		alignSelf: 'center'
	},
	bottomText: {
		alignSelf: 'center',
		fontSize: 10
	}
});
