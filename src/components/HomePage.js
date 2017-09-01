import { Linking, View } from 'react-native';
import { Permissions, Notifications } from 'expo';
import DropdownAlert from 'react-native-dropdownalert';
import React from 'react';

import ModalRouter from './ModalRouter';
import Tabs from './Tabs.js';
import { goToPost, goToApp } from '../utils/loadpostorapp.js';
import firebase from 'firebase';

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
			goToPost(postID);
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
		global.setCurrentModal(null);
		if (notification.origin === 'selected') {
			//'selected' means clicking notification caused app to open
			if (notification.data.url) {
				this._link(notification.data.url);
			} else {
				if (notification.data.type === 'applicationSent') {
					//'applicationSent' means a new reply or reminder to your post
					goToPost(notification.data.post);
				} else if (notification.data.type === 'applicantAccepted') {
					//'applicationAccepted' means your reply to a post was accepted
					goToApp(notification.data.app);
				}
			}
		} else if (notification.origin === 'received') {
			//'received' means app was foregrounded when notification was received

			if (notification.data.url) {
				//Link into app from 'new post in your area' notification
				let url = notification.data.url;
				const parameters = url.slice(url.indexOf('+') + 1).split('/');
				if (parameters[0] === 'post') {
					const postID = parameters[1];
					this.redirectPage = { post: postID };
					firebase
						.database()
						.ref('posts')
						.child(postID)
						.child('title')
						.once('value')
						.then(postTitle => {
							this._setDropDown(
								'New Post In Your Area!',
								postTitle.val().original
							);
						});
				}
			} else if (notification.data.type === 'applicationSent') {
				//'applicationSent' means a new reply or reminder to your post
				this.redirectPage = { post: notification.data.post };
				this._setDropDown(
					'You have a reply to your post!',
					notification.data.postTitle
				);
			} else if (notification.data.type === 'applicantAccepted') {
				//'applicationAccepted' means your reply to a post was accepted
				this.redirectPage = { application: notification.data.app };
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
			console.log(this.redirectPage);
			if (this.redirectPage.application) {
				goToApp(this.redirectPage.application);
			} else if (this.redirectPage.post) {
				goToPost(this.redirectPage.post);
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
