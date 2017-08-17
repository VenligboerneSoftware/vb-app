import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import Modal from 'react-native-modal';
import React, { Component } from 'react';
import firebase from 'firebase';

import { Entypo } from '@expo/vector-icons';

import Colors from '../styles/Colors';
import ExitBar from './ExitBar';
import NewNotification from './NewNotification';
import SharedStyles from '../styles/SharedStyles';

export default class ManageNotifications extends Component {
	constructor(props) {
		super(props);
		this.state = {
			subscriptions: {},
			newNotificationVisible: false
		};
	}

	async componentDidMount() {
		// TODO fuckity fuck fuck permissions
		firebase
			.database()
			.ref('subscriptions')
			.orderByChild('owner')
			.equalTo(firebase.auth().currentUser.uid)
			.on('value', snap => {
				let subscriptions = snap.val();
				for (key in subscriptions) {
					subscriptions[key].key = key;
				}
				this.setState({
					subscriptions: subscriptions
				});
			});
	}

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
				<FlatList
					data={Object.values(this.state.subscriptions)}
					ItemSeparatorComponent={() => <View style={SharedStyles.divider} />}
					renderItem={({ item }) =>
						<Text key={item.key}>
							{JSON.stringify(item)}
						</Text> /* TODO figure out UI */}
				/>
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
