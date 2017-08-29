import { Linking, Platform, View } from 'react-native';
import { Permissions, Notifications } from 'expo';
import React from 'react';
import firebase from 'firebase';

import PostOrCenterModal from './PostOrCenterModal';
import Tabs from './Tabs.js';
import DropdownAlert from 'react-native-dropdownalert';
import ModalRouter from './ModalRouter';

export default class HomePage extends React.Component {
	constructor() {
		super();
		this.state = {
			selectedTab: 'Map',
			badgeCounts: {
				Me: 0,
				Map: 0
			},
			loaded: false
		};

		// TODO there must be a better pattern for this
		global.onLanguageChange = { home: this.forceUpdate.bind(this) };

		Linking.addEventListener('url', urlPacket => {
			this._link(urlPacket.url);
		});
		Linking.getInitialURL().then(this._link);
	}

	_link = url => {
		if (url.indexOf('+') === -1 || url.indexOf('+') === url.length - 1) {
			// There is no extra data. This is just a normal startup
			return;
		}

		const parameters = url.slice(url.indexOf('+') + 1).split('/');
		if (parameters[0] === 'post') {
			const postID = parameters[1];
			firebase
				.database()
				.ref('posts')
				.child(postID)
				.once('value')
				.then(postSnap => {
					if (postSnap.exists()) {
						let post = postSnap.val();
						post.key = postSnap.key;
						post.applications = post.applications || {};
						this.setState({ linkedPost: post, showPost: true });
					}
				});
		} else {
			console.warn('Unrecognized deep linking URL', url);
		}
	};

	async registerForPushNotificationsAsync() {
		const { existingStatus } = await Permissions.getAsync(
			Permissions.NOTIFICATIONS
		);

		// only ask if permissions have not already been determined, because
		// iOS won't necessarily prompt the user a second time.
		if (existingStatus !== 'granted') {
			// Android remote notification permissions are granted during the app
			// install, so this will only ask on iOS
			await Permissions.askAsync(Permissions.NOTIFICATIONS);
		}
	}

	_handleNotification = notification => {
		if (Platform.OS === 'android' && notification.origin === 'selected') {
			if (notification.data.url) {
				this._link(notification.data.url);
			} else {
				// TODO make all notification actions use deep linking
				if (notification.data.type === 'applicantAccepted') {
					global.changeTab('Me', () => {
						global.profileIndex(1);
					});
				} else {
					global.changeTab('Me', () => {
						global.profileIndex(0);
					});
				}
			}
		} else {
			//iOS specific code
			if (notification.data.url) {
				this.setState({
					badgeCounts: {
						...this.state.badgeCounts,
						Map: this.state.badgeCounts.Map + 1
					}
				});
			} else {
				this.setState({
					badgeCounts: {
						...this.state.badgeCounts,
						Me: this.state.badgeCounts.Me + 1
					}
				});
			}
		}
	};

	componentWillMount() {
		this.registerForPushNotificationsAsync();
		Notifications.addListener(this._handleNotification);
	}

	componentDidMount() {
		this.setState({ loaded: true });

		global.setDropDown = (title, message) => {
			this.dropdown.alertWithType('info', title, message);
			console.log('Alert FIRED');
		};
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<PostOrCenterModal
					isVisible={this.state.showPost}
					post={this.state.linkedPost}
					hide={() => this.setState({ showPost: false })}
				/>
				<Tabs
					badgeCounts={this.state.badgeCounts}
					setBadgeCount={(tab, count) => {
						this.state.badgeCounts[tab] = count;
					}}
				/>
				<ModalRouter />
				<DropdownAlert
					ref={ref => (this.dropdown = ref)}
					onClose={data => {
						console.log(data);
					}}
				/>
			</View>
		);
	}
}
