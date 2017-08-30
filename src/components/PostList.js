import { View } from 'react-native';
import React from 'react';

import BarePostList from './BarePostList';

export default class PostList extends React.PureComponent {
	_showPostModal = post =>
		global.setCurrentModal('/PostOrCenterModal', {
			post: post
		});

	_showApplicationsModal = post =>
		global.setCurrentModal('/ViewApplications', {
			post: post
		});

	render() {
		return (
			<View style={{ flex: 1 }}>
				<BarePostList
					listData={this.props.listData}
					sortCenter={this.props.sortCenter}
					distanceCenter={this.props.distanceCenter}
					showPostModal={this._showPostModal}
					showApplicationsModal={this._showApplicationsModal}
					message={this.props.message}
				/>
			</View>
		);
	}
}
