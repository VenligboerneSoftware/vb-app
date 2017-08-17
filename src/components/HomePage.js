import {
	Alert,
	Linking,
	Platform,
	StatusBar,
	StyleSheet,
	View
} from 'react-native';
import { Permissions, Notifications } from 'expo';
import React from 'react';
import SideMenu from 'react-native-side-menu';
import TabNavigator from 'react-native-tab-navigator';
import firebase from 'firebase';

import { FontAwesome } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';

import Menu from './Menu.js';
import NewPost from './NewPost.js';
import News from './News.js';
import PostOrCenterModal from './PostOrCenterModal';
import Profile from './Profile.js';
import ViewPosts from './ViewPosts';

export default class HomePage extends React.Component {
	constructor() {
		super();
		this.state = {
			selectedTab: 'Map',
			tabStyle: styles.tabStyleSelected,
			isOpen: false,
			meNotifications: 0
		};

		global.openMenu = () => {
			this.setState({ isOpen: true });
		};

		global.closeMenu = () => {
			this.setState({ isOpen: false });
		};

		global.changeTab = (tab, callback) => {
			this.setState({ selectedTab: tab }, callback);
		};

		global.onLanguageChange = [this.forceUpdate.bind(this)];

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

	_incrementMeBadge = () => {
		var currNotifications = this.state.meNotifications + 1;
		this.setState({ meNotifications: currNotifications });
	};

	_handleNotification = notification => {
		if (Platform.OS === 'android' && notification.origin === 'selected') {
			// TODO make all notification actions use deep linking
			if (notification.data.url) {
				this._link(notification.data.url);
			} else {
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
				//TODO
			} else {
				this._incrementMeBadge();
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
				<View style={{ flex: 1 }}>
					<TabNavigator>
						{/* This tab contains the MapView and ListView because they are
						actually the same component */}
						<TabNavigator.Item
							key={'Map'}
							selected={
								this.state.selectedTab === 'Map' ||
								this.state.selectedTab === 'List'
							}
							title={translate('Map')}
							tabStyle={
								this.state.selectedTab === 'Map'
									? styles.tabStyleSelected
									: styles.tabStyleUnselected
							}
							selectedTitleStyle={
								this.state.selectedTab === 'Map'
									? styles.titleStyleSelected
									: styles.titleStyleUnselected
							}
							renderIcon={() => <FontAwesome name={'map'} size={30} />}
							renderSelectedIcon={() => <FontAwesome name={'map'} size={30} />}
							onPress={() => {
								this.setState({ selectedTab: 'Map' });
							}}
						>
							<ViewPosts mode={this.state.selectedTab} />
						</TabNavigator.Item>

						{/* This is a dummy tab that controls the map/list mode of the previous
						tab */}
						<TabNavigator.Item
							key={'List'}
							selected={false}
							title={translate('List')}
							tabStyle={
								this.state.selectedTab === 'List'
									? styles.tabStyleSelected
									: styles.tabStyleUnselected
							}
							titleStyle={
								this.state.selectedTab === 'List'
									? styles.titleStyleSelected
									: styles.titleStyleUnselected
							}
							renderIcon={() => <FontAwesome name={'list-ul'} size={30} />}
							renderSelectedIcon={() =>
								<FontAwesome name={'list-ul'} size={30} />}
							onPress={() => {
								this.setState({ selectedTab: 'List' });
							}}
						/>

						{[
							{
								key: 'New Post',
								icon: 'plus-square-o',
								component: <NewPost />
							},
							{
								key: 'News',
								icon: 'newspaper-o',
								component: <News />
							},
							{
								key: 'Me',
								icon: 'user',
								component: <Profile />
							}
						].map(tab =>
							<TabNavigator.Item
								key={tab.key}
								selected={this.state.selectedTab === tab.key}
								title={translate(tab.key)}
								tabStyle={
									this.state.selectedTab === tab.key
										? styles.tabStyleSelected
										: styles.tabStyleUnselected
								}
								renderIcon={() => <FontAwesome name={tab.icon} size={30} />}
								renderSelectedIcon={() =>
									<FontAwesome name={tab.icon} size={30} />}
								onPress={() => {
									if (tab.key === 'Me') {
										this.setState({ selectedTab: tab.key, meNotifications: 0 });
									} else {
										this.setState({ selectedTab: tab.key });
									}
								}}
								badgeText={
									tab.key === 'Me' && this.state.meNotifications > 0
										? this.state.meNotifications.toString()
										: null
								}
							>
								{tab.component}
							</TabNavigator.Item>
						)}
					</TabNavigator>
					<View style={this.state.isOpen ? styles.overlay : null} />
				</View>
			</SideMenu>
		);
	}
}

const styles = StyleSheet.create({
	tabStyleUnselected: {
		backgroundColor: 'white',
		paddingTop: 5
	},
	tabStyleSelected: {
		backgroundColor: 'lightgrey',
		paddingTop: 5
	},
	titleStyleSelected: {
		color: '#007aff'
	},
	titleStyleUnselected: {
		color: '#929292'
	},
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
