import { Location, Permissions } from 'expo';
import { Platform, StyleSheet, View } from 'react-native';
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
			mapRegion: {
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
		let { status } = await Permissions.askAsync(Permissions.LOCATION);
		if (status === 'granted') {
			const location = await Location.getCurrentPositionAsync({});
			this.currentLocation = location;
			this.setState({
				mapRegion: {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
					latitudeDelta: 0.2,
					longitudeDelta: 0.4
				}
			});
		} else {
			console.warn('Get current location failed', status);
		}
		this._syncFriendliness();
	}

	// syncFriendliness
	// ---------------------------------------------------------------------------
	// Use an on listener so that the this.posts variable always holds the
	// current posts table in Firebase, with updates.
	_syncFriendliness = () => {
		// TODO make this listener more efficient with child_changed
		firebase.database().ref('posts').on('value', async posts => {
			this.posts = posts.val();
			for (var key in this.posts) {
				this.posts[key].key = key;
				// Default to an empty object if there are no applications
				this.posts[key].applications = this.posts[key].applications || {};
			}
			this._getPosts();
		});
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

		console.log('posts filtered', Date.now());
		// TODO Is there a non platform specific solution to this?
		// Is the OS really even the determining factor of the behavior?
		if (Platform.OS === 'android') {
			// Clear listData first to fix Android custom icons issue
			this.setState({ listData: [] }, () => {
				this.setState({ listData: posts });
			});
		} else {
			// Clearing listdata causes flashing on iOS
			this.setState({ listData: posts });
		}
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
					location={this.currentLocation ? this.currentLocation.coords : null}
				/>
				<FilterBar
					onFilterChange={this._setFilter}
					filter={this.state.filter}
					showDatePicker={this.props.mode === 'List'}
				/>

				{this.props.mode === 'List'
					? <PostList
							listData={/* Remove own posts from ListView */
							this.state.listData.filter(
								post =>
									post.owner !== firebase.auth().currentUser.uid &&
									this._checkDate(post, this.state.filter)
							)}
							sortCenter={this.state.mapRegion}
							distanceCenter={
								this.currentLocation
									? this.currentLocation.coords
									: this.state.mapRegion
							}
							message={
								<ClearFilter
									onPress={this._clearFilter}
									filterApplied={this.filterApplied()}
								/>
							}
						/>
					: <MapViewPage
							listData={this.state.listData}
							mapRegion={this.state.mapRegion}
							onRegionChange={global.setRegion}
							message={
								<ClearFilter
									onPress={this._clearFilter}
									filterApplied={this.filterApplied()}
								/>
							}
						/>}
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
