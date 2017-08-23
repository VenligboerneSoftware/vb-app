import { StyleSheet } from 'react-native';
import Expo from 'expo';
import React from 'react';
import TabNavigator from 'react-native-tab-navigator';

import { FontAwesome } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';

import NewPost from './NewPost.js';
import News from './News.js';
import Profile from './Profile.js';
import ViewPosts from './ViewPosts';

export default class HomePage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// Initially, load the news page to start the articles loading
			selectedTab: 'News'
		};

		global.changeTab = (tab, callback) => {
			this.setState({ selectedTab: tab }, callback);
		};
	}

	componentDidMount() {
		// Load the posts on the Me page
		this.setState({ selectedTab: 'Map' });
	}

	_setTab = tab => {
		// Expo.Amplitude.logEventWithProperties('Change Tab', {
		// 	from: this.state.selectedTab,
		// 	to: tab
		// });
		// Clear the badges for this tab
		this.props.setBadgeCount(tab, 0);
		this.setState({ selectedTab: tab });
	};

	render() {
		return (
			<TabNavigator
				style={{ flex: 1 }}
				tabBarStyle={{ height: 50 }} //TODO: Fix android numbers
				sceneStyle={{ paddingBottom: 50 }}
			>
				{[
					// This tab contains the MapView and ListView because they are
					// actually the same component
					{
						key: 'Map',
						selected: ['Map', 'List'],
						icon: 'map',
						component: <ViewPosts mode={this.state.selectedTab} />
					},
					// This is a dummy tab that controls the map/list mode of the previous tab
					{
						key: 'List',
						selected: [],
						icon: 'list-ul'
					},
					{
						key: 'New Post',
						selected: ['New Post'],
						icon: 'plus-square-o',
						component: <NewPost />
					},
					{
						key: 'News',
						selected: ['News'],
						icon: 'newspaper-o',
						component: <News />
					},
					{
						key: 'Me',
						selected: ['Me'],
						icon: 'user',
						component: <Profile />
					}
				].map(tab =>
					<TabNavigator.Item
						key={tab.key}
						selected={tab.selected.indexOf(this.state.selectedTab) !== -1}
						title={translate(tab.key)}
						tabStyle={
							tab.key === this.state.selectedTab
								? styles.tabStyleSelected
								: styles.tabStyleUnselected
						}
						selectedTitleStyle={
							tab.key === this.state.selectedTab
								? styles.titleStyleSelected
								: styles.titleStyleUnselected
						}
						titleStyle={
							tab.key === this.state.selectedTab
								? styles.titleStyleSelected
								: styles.titleStyleUnselected
						}
						renderIcon={() => <FontAwesome name={tab.icon} size={30} />}
						renderSelectedIcon={() => <FontAwesome name={tab.icon} size={30} />}
						onPress={this._setTab.bind(this, tab.key)}
						badgeText={this.props.badgeCounts[tab.key]}
					>
						{tab.component}
					</TabNavigator.Item>
				)}
			</TabNavigator>
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
	}
});
