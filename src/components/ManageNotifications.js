import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import Modal from 'react-native-modal';
import React, { Component } from 'react';
import firebase from 'firebase';
import { FontAwesome } from '@expo/vector-icons';

import { Entypo } from '@expo/vector-icons';

import { translate } from '../utils/internationalization';
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
				let subscriptions = snap.val() || {};
				for (const key in subscriptions) {
					subscriptions[key].key = key;
				}
				this.setState({
					subscriptions: subscriptions
				});
			});
	}

	_deleteSubscription(subscription) {
		firebase.database().ref('subscriptions').child(subscription.key).remove();
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

				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-around',
						marginTop: 10,
						marginBottom: 5
					}}
				>
					<View style={{ flex: 1 }} />
					<Text style={styles.heading}>
						{translate('Range')}
					</Text>
					<Text style={styles.heading}>
						{translate('Location')}
					</Text>
					<View style={{ flex: 1 }} />
				</View>

				<View style={[SharedStyles.divider, { height: 3 }]} />
				<FlatList
					style={{ width: '100%' }}
					data={Object.values(this.state.subscriptions)}
					ItemSeparatorComponent={() => <View style={SharedStyles.divider} />}
					renderItem={({ item }) =>
						<View
							key={item.key}
							style={{
								flexDirection: 'row',
								justifyContent: 'space-around',
								alignItems: 'center',
								padding: 10
							}}
						>
							<View style={{ alignItems: 'center', flex: 1 }}>
								<Image
									style={{
										tintColor: Colors.blue.dark,
										width: 50,
										height: 50,
										resizeMode: 'contain'
									}}
									source={{ uri: global.db.categories[item.icon].iconURL }}
								/>

								<Text
									style={{
										color: Colors.blue.dark,
										fontSize: 10,
										textAlign: 'center'
									}}
								>
									{translate(global.db.categories[item.icon].title)}
								</Text>
							</View>

							<Text style={{ fontSize: 16, flex: 1, textAlign: 'center' }}>
								{item.radius + ' KM'}
							</Text>
							<Text style={{ fontSize: 12, flex: 2 }} numberOfLines={2}>
								{item.formatted_address}
							</Text>

							<TouchableOpacity
								onPress={this._deleteSubscription.bind(this, item)}
								style={{
									backgroundColor: Colors.grey.light,
									padding: 5,
									borderRadius: 10,
									marginLeft: 10
								}}
							>
								<FontAwesome name={'trash-o'} size={26} />
							</TouchableOpacity>
						</View>}
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
	heading: {
		flex: 1,
		fontSize: 18,
		fontWeight: '500'
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
