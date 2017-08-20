import { FlatList, View } from 'react-native';
import React from 'react';

import PostListItem from './PostListItem.js';
import SharedStyles from '../styles/SharedStyles';
import getDistance from '../utils/getDistance';

export default class BarePostList extends React.PureComponent {
	// Sort the posts by increasing distance from the mapRegion center, if specified.
	// Use the users current location to label distance, but fall back on the
	// map region center.
	_sort = posts => {
		posts = posts
			// Calculate distances
			.map(post => ({
				distance: getDistance(this.props.sortCenter, post),
				post: post
			}))
			// Sort by distance
			.sort((a, b) => a.distance - b.distance)
			.map(obj => obj.post);
		return posts;
	};

	render() {
		return (
			<FlatList
				data={
					this.props.sortCenter
						? this._sort(this.props.listData)
						: this.props.listData
				}
				keyboardShouldPersistTaps={'handled'}
				style={{ flex: 1 }}
				ItemSeparatorComponent={() => <View style={SharedStyles.divider} />}
				renderItem={({ item }) =>
					<PostListItem
						item={item}
						showModal={this.props.showModal}
						showApplications={this.props.showApplications}
						distanceCenter={this.props.distanceCenter}
					/>}
				ListFooterComponent={this.props.message}
			/>
		);
	}
}
