import { StyleSheet, View, Text, Image } from 'react-native';
import { TabViewAnimated, TabBar } from 'react-native-tab-view';
import Expo from 'expo';
import React from 'react';
import firebase from 'firebase';

import { translate } from 'venligboerneapp/src/utils/internationalization.js';

import Colors from '../styles/Colors.js';
import MyApplications from './MyApplications.js';
import PostList from './PostList.js';
import TopBar from './TopBar.js';

export default class Profile extends React.Component {
	constructor() {
		super();
		this.state = {
			index: 0,
			routes: [
				{ key: '1', title: translate('My Posts') },
				{ key: '2', title: translate('My Applications') }
			],
			listData: []
		};

		global.onLanguageChange.push(() => {
			// Retranslate the tab headers into a new language
			this.setState({
				routes: [
					{ key: '1', title: translate('My Posts') },
					{ key: '2', title: translate('My Applications') }
				]
			});
		});

		// TODO This is a derpy fix. This setState must be called after the component
		// loads.
		global.profileIndex = index => {
			setTimeout(() => {
				this.setState({ index: index });
			}, 100);
		};
	}

	componentDidMount() {
		firebase
			.database()
			.ref('posts')
			.orderByChild('owner')
			.equalTo(firebase.auth().currentUser.uid)
			.on('value', posts => {
				posts = posts.val();
				for (var key in posts) {
					posts[key].key = key;
					// Default to an empty object if there are no applications
					posts[key].applications = posts[key].applications || {};
				}
				this.setState({ listData: posts === null ? [] : Object.values(posts) });
			});
	}

	_handleIndexChange = index => {
		this.setState({ index: index });
		Expo.Amplitude.logEventWithProperties('Switching My Profile tab', {
			to: index === 1 ? 'My Posts' : 'My Applications'
		});
	};

	_renderHeader = props =>
		<TabBar
			labelStyle={{ color: 'black' }}
			style={{ backgroundColor: 'white' }}
			indicatorStyle={{ backgroundColor: Colors.blue.dark }}
			{...props}
		/>;

	_renderScene = route => {
		const scenes = {
			'1':
				<PostList
					listData={route.navigationState.listData}
					message={
						route.navigationState.listData.length === 0
							? <Text>
									{translate('You have not created any posts.')}
								</Text>
							: null
					}
				/>
			,
			'2': <MyApplications />
		};
		return scenes[route.route.key];
	};

	render() {
		let profilePicURL =
			'https://graph.facebook.com/' +
			firebase.auth().currentUser.providerData[0].uid +
			'/picture?height=300'; //Profile Photo Doesn't Update Otherwise
		return (
			<View style={styles.container}>
				<TopBar title={translate('My Profile')} />
				<View style={styles.profileInfo}>
					<Image
						style={styles.profileImage}
						source={{
							uri: profilePicURL
						}}
					/>
					<Text style={styles.profileName}>
						{firebase.auth().currentUser.displayName}
					</Text>
				</View>
				<TabViewAnimated
					navigationState={this.state}
					renderScene={this._renderScene}
					renderHeader={this._renderHeader}
					onIndexChange={this._handleIndexChange}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		padding: 0,
		backgroundColor: 'white'
	},
	profileInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		marginTop: 20,
		marginBottom: 20
	},
	profileImage: {
		height: 80,
		width: 80,
		borderRadius: 40,
		marginLeft: 20
	},
	profileName: {
		fontSize: 22,
		marginRight: 20
	}
});
