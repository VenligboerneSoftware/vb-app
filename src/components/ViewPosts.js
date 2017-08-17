import { Location, Permissions } from 'expo';
import { StyleSheet, View } from 'react-native';
import React from 'react';
import firebase from 'firebase';
import geolib from 'geolib';

import ClearFilter from './ClearFilter.js';
import FilterBar from './FilterBar.js';
import MapViewPage from './MapViewPage';
import PostList from './PostList';
import TopBar from './TopBar.js';
import { checkFilters } from '../utils/dates';

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
			this.setState(
				{
					mapRegion: mapRegion
				},
				() => {
					// If the Map is unmounted (which it is when the user is in the
					// list view) this is a null pointer. Don't set the mapRegion. It
					// will automatically update when the user tabs back.
					if (this.map) {
						this.map.setRegion(this.state.mapRegion);
					}
					this._getPosts();
				}
			);
		};

		this.posts = {};
	}

	// componentMount
	// ---------------------------------------------------------------------------
	// When the map loads, get the users current location and pan to it.
	async componentDidMount() {
		this._syncFriendliness();
		let { status } = await Permissions.askAsync(Permissions.LOCATION);
		if (status === 'granted') {
			const location = await Location.getCurrentPositionAsync({});
			this.currentLocation = location;
			this._onRegionChange({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				latitudeDelta: 0.2,
				longitudeDelta: 0.4
			});
		} else {
			console.log('Get current location failed', status);
		}
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

		// Sort the posts by increasing distance from the mapRegion center.
		// Use the users current location to label distance, but fall back on the
		// map region center.
		const distanceOrigin = this.currentLocation
			? this.currentLocation.coords
			: this.state.mapRegion;
		posts = geolib
			.orderByDistance(this.state.mapRegion, posts)
			.map(sortResult => ({
				distance: geolib.getDistance(distanceOrigin, posts[sortResult.key]),
				...posts[sortResult.key]
			}));
		// Make a deep copy to avoid immutability issues
		this.setState({
			listData: JSON.parse(JSON.stringify(posts)),
			loaded: true
		});
	};

	_checkIcon = (post, filter) =>
		filter.icon.length === 0 || filter.icon.indexOf(post.icon) !== -1;

	_checkDate = (post, filter) => {
		return checkFilters(post.dates, filter.start, filter.end);
	};

	_checkRegion = (post, region) =>
		post.latitude > region.latitude - region.latitudeDelta / 2.0 &&
		post.latitude < region.latitude + region.latitudeDelta / 2.0 &&
		post.longitude > region.longitude - region.longitudeDelta / 2.0 &&
		post.longitude < region.longitude + region.longitudeDelta / 2.0;

	_onRegionChange = mapRegion => {
		global.setRegion(mapRegion);
		this._getPosts();
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
							message={
								<ClearFilter
									onPress={this._clearFilter}
									filterApplied={this.filterApplied()}
								/>
							}
						/>
					: <MapViewPage
							ref={instance => {
								this.map = instance;
							}}
							listData={this.state.listData.filter(post =>
								this._checkRegion(post, this.state.mapRegion)
							)}
							mapRegion={this.state.mapRegion}
							onRegionChange={this._onRegionChange}
							message={
								this.state.loaded
									? <ClearFilter
											onPress={this._clearFilter}
											filterApplied={this.filterApplied()}
										/>
									: null
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
