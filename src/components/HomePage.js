import { Linking, Platform, View } from 'react-native';
import { Permissions, Notifications } from 'expo';
import DropdownAlert from 'react-native-dropdownalert';
import React from 'react';
import firebase from 'firebase';

import ModalRouter from './ModalRouter';
import Tabs from './Tabs.js';

export default class HomePage extends React.Component {
	constructor() {
		super();
		this.state = {
			selectedTab: 'Map'
		};

		// TODO there must be a better pattern for this
		global.onLanguageChange = { home: this.forceUpdate.bind(this) };

		Linking.addEventListener('url', urlPacket => {
			this._link(urlPacket.url);
		});
		Linking.getInitialURL().then(this._link);
	}

	//used to open a post if app is opened from a deep link
	_link = url => {
		if (url.indexOf('+') === -1 || url.indexOf('+') === url.length - 1) {
			// There is no extra data. This is just a normal startup
			return;
		}

		const parameters = url.slice(url.indexOf('+') + 1).split('/');
		if (parameters[0] === 'post') {
			const postID = parameters[1];
			this._goToPost(postID);
		} else {
			console.warn('Unrecognized deep linking URL', url);
		}
	};

	//Given a valid postID, will open that post within the app
	_goToPost = postID => {
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
					global.setCurrentModal('/PostOrCenterModal', {
						post: post
					});
				}
			});
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
		if (notification.origin === 'selected') {
			//'selected' means clicking notification caused app to open
			if (notification.data.url) {
				this._link(notification.data.url);
			} else {
				if (notification.data.type === 'applicationSent') {
					//'applicationSent' means a new reply or reminder to your post
					this._goToPost(notification.data.post);
				} else if (notification.data.type === 'applicantAccepted') {
					//'applicationAccepted' means your reply to a post was accepted
					global.changeTab('Me', () => {
						global.profileIndex(1);
					});
				}
			}
		} else if (notification.origin === 'received') {
			//'received' means app was foregrounded when notification was received
			if (notification.data.type === 'applicationSent') {
				this.redirectPage = notification.data.post;
				this._setDropDown(
					'You have a reply to your post!',
					notification.data.postTitle
				);
			} else if (notification.data.type === 'applicantAccepted') {
				this.redirectPage = 'application';
				this._setDropDown(
					'Your reply has been accepted!',
					notification.data.postTitle
				);
			}
		}
	};

	_setDropDown = (title, message) => {
		this.dropdown.alertWithType(
			'info',
			title ? title : '',
			message ? message : ''
		);
	};

	_dropdownClose = data => {
		if (data.action === 'tap') {
			if (this.redirectPage === 'application') {
				global.changeTab('Me', () => {
					global.profileIndex(1);
				});
			} else if (this.redirectPage) {
				this._goToPost(this.redirectPage);
			}
		}
	};

	componentWillMount() {
		this.registerForPushNotificationsAsync();
		Notifications.addListener(this._handleNotification);
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<Tabs />
				<ModalRouter />
				<DropdownAlert
					ref={ref => (this.dropdown = ref)}
					onClose={data => this._dropdownClose(data)}
				/>
			</View>
		);
	}
}
