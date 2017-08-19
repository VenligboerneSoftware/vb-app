import { Linking, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Permissions, Notifications } from 'expo';
import React from 'react';
import SideMenu from 'react-native-side-menu';
import firebase from 'firebase';

import Menu from './Menu.js';
import Tabs from './Tabs.js';
import PostOrCenterModal from './PostOrCenterModal';

export default class HomePage extends React.Component {
	constructor() {
		super();
		this.state = {
			selectedTab: 'Map',
			tabStyle: styles.tabStyleSelected,
			isOpen: false,
			badgeCounts: {
				Me: 0,
				Map: 0
			}
		};

		global.openMenu = () => {
			this.setState({ isOpen: true });
		};

		global.closeMenu = () => {
			this.setState({ isOpen: false });
		};

		// TODO there must be a better pattern for this
		global.onLanguageChange = { home: this.forceUpdate.bind(this) };

		Linking.addEventListener('url', urlPacket => {
			this._link(urlPacket.url);
		});
		Linking.getInitialURL().then(this._link);
	}

	_link = url => {
		global.closeMenu();

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

	render() {
		return (
			<SideMenu
				menu={<Menu />}
				disableGestures={true}
				isOpen={this.state.isOpen}
				onChange={isOpen => {
					this.setState({ isOpen: isOpen });
				}}
			>
				<StatusBar barStyle="dark-content" />
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
				<View style={this.state.isOpen ? styles.overlay : null} />
			</SideMenu>
		);
	}
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		position: 'absolute',
		left: 0,
		top: 0,
		opacity: 0.5,
		backgroundColor: 'black',
		width: '100%',
		height: '100%'
	}
});
