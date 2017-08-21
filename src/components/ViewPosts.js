import { StyleSheet, View } from 'react-native';
import React from 'react';
import firebase from 'firebase';

import { checkFilters } from '../utils/dates';
import ClearFilter from './ClearFilter.js';
import FilterBar from './FilterBar.js';
import MapViewPage from './MapViewPage';
import PostList from './PostList';
import TopBar from './TopBar.js';

export default class ViewPosts extends React.Component {
	constructor() {
		super();
		this.state = {
			listData: [],
			// Set default viewport (without GPS) to Denmark
			mapRegion: global.location
				? {
						latitude: global.location.coords.latitude,
						longitude: global.location.coords.longitude,
						latitudeDelta: 0.2,
						longitudeDelta: 0.4
					}
				: {
						latitude: 55.8,
						latitudeDelta: 2,
						longitude: 10.3,
						longitudeDelta: 5
					},
			filter: {
				start: null,
				end: null,
				icon: []
			}
		};

		global.setRegion = mapRegion => {
			this.setState({ mapRegion: mapRegion });
		};

		this.posts = {};
	}

	// componentMount
	// ---------------------------------------------------------------------------
	// When the map loads, get the users current location and pan to it.
	async componentDidMount() {
		this._syncFriendliness();
	}

	// syncFriendliness
	// ---------------------------------------------------------------------------
	// Use an on listener so that the this.posts variable always holds the
	// current posts table in Firebase, with updates.
	_syncFriendliness = () => {
		// TODO make this listener more efficient with child_changed
		firebase.database().ref('posts').on(
			'value',
			async posts => {
				this.posts = posts.val();
				for (var key in this.posts) {
					this.posts[key].key = key;
					// Default to an empty object if there are no applications
					this.posts[key].applications = this.posts[key].applications || {};
				}
				this._getPosts();
			},
			error => {
				console.warn('Database load error', error);
				if (error.code === 'PERMISSION_DENIED') {
					alert(
						'You have been banned by an administrator for inappropriate use of the app. Please email venligboerneapp@gmail.com for more details.'
					);
				}
			}
		);
	};

	_setFilter = filter => {
		this.setState({ filter: filter }, () => {
			this._getPosts();
		});
	};

	_clearFilter = () => {
		this.setState(
			{
				filter: {
					start: null,
					end: null,
					icon: []
				}
			},
			() => {
				this._getPosts();
			}
		);
	};

	_getPosts = () => {
		// Add the posts and the centers together
		// They are all displayed on map and list
		let posts = Object.values(global.db.centers).concat(
			Object.values(this.posts)
		);

		// check the event meets the filter criteria
		posts = posts.filter(post => this._checkIcon(post, this.state.filter));

		this.setState({ listData: posts });
	};

	_checkIcon = (post, filter) =>
		filter.icon.length === 0 || filter.icon.indexOf(post.icon) !== -1;

	_checkDate = (post, filter) => {
		return checkFilters(post.dates, filter.start, filter.end);
	};

	_convertDetailsToRegion = details => {
		const pickedLocation = details.geometry;
		let currMapRegion = {};
		currMapRegion.latitude = pickedLocation.location.lat;
		currMapRegion.longitude = pickedLocation.location.lng;
		currMapRegion.latitudeDelta =
			(pickedLocation.viewport.northeast.lat -
				pickedLocation.viewport.southwest.lat) /
			2.0;
		currMapRegion.longitudeDelta =
			(pickedLocation.viewport.northeast.lng -
				pickedLocation.viewport.southwest.lng) /
			2.0;
		return currMapRegion;
	};

	filterApplied = () => {
		return (
			this.state.filter.start ||
			this.state.filter.end ||
			this.state.filter.icon.length !== 0
		);
	};

	render() {
		return (
			<View style={styles.container}>
				<TopBar
					search={true}
					onSelectLocation={(data, details) => {
						const mapRegion = this._convertDetailsToRegion(details);
						global.setRegion(mapRegion);
					}}
				/>
				<FilterBar
					onFilterChange={this._setFilter}
					filter={this.state.filter}
					showDatePicker={this.props.mode === 'List'}
				/>

				{this.props.mode === 'List'
					? <PostList
							listData={this.state.listData.filter(
								post =>
									/* Remove own posts from ListView */
									post.owner !== firebase.auth().currentUser.uid &&
									this._checkDate(post, this.state.filter)
							)}
							sortCenter={this.state.mapRegion}
							distanceCenter={this.state.mapRegion}
							message={
								<ClearFilter
									onPress={this._clearFilter}
									filterApplied={this.filterApplied()}
								/>
							}
						/>
					: null}

				{this.props.mode === 'Map'
					? <MapViewPage
							listData={this.state.listData}
							mapRegion={this.state.mapRegion}
							onRegionChange={global.setRegion}
							message={
								<ClearFilter
									onPress={this._clearFilter}
									filterApplied={this.filterApplied()}
								/>
							}
						/>
					: null}
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
	}
});
