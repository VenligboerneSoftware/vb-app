import { Dimensions, FlatList, View } from 'react-native';
import React from 'react';

import PostListItem from './PostListItem.js';
import SharedStyles from '../styles/SharedStyles';

export default class BarePostList extends React.PureComponent {
	// Rather inaccurate, but very fast, geodistance function
	getDistance = (a, b) => {
		const deltaLatitude = a.latitude - b.latitude;
		const deltaLongitude =
			(a.longitude - b.longitude) * Math.cos(a.latitude / 180.0 * Math.PI);
		const totalDegrees = Math.sqrt(
			deltaLatitude * deltaLatitude + deltaLongitude * deltaLongitude
		);
		// 111319 is the width of one degree latitude in meters
		return totalDegrees * 111319;
	};

	// Sort the posts by increasing distance from the mapRegion center, if specified.
	// Use the users current location to label distance, but fall back on the
	// map region center.
	_sort = posts => {
		console.log('Sorting start ', Date.now());
		posts = posts
			// Calculate distances
			.map(post => ({
				distance: this.getDistance(this.props.sortCenter, post),
				post: post
			}))
			// Sort by distance
			.sort((a, b) => a.distance - b.distance)
			.map(obj => obj.post);
		console.log('Sort complete ', Date.now());
		return posts;
	};

	render() {
		console.log('Rendering a BarePostList', this.props.listData.length);
		return (
			<FlatList
				data={
					this.props.sortCenter
						? this._sort(this.props.listData)
						: this.props.listData
				}
				keyboardShouldPersistTaps={'handled'}
				style={{ flex: 1, width: Dimensions.get('window').width }}
				ItemSeparatorComponent={() => <View style={SharedStyles.divider} />}
				renderItem={({ item }) =>
					<PostListItem
						item={item}
						showModal={this.props.showModal}
						showApplications={this.props.showApplications}
					/>}
				ListFooterComponent={this.props.message}
			/>
		);
	}
}
