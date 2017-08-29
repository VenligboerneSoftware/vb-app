import { View } from 'react-native';
import Modal from './Modal.js';
import React from 'react';

import PostOrCenterModal from './PostOrCenterModal';
import ViewApplications from './ViewApplications';
import BarePostList from './BarePostList';

export default class PostList extends React.PureComponent {
	constructor() {
		super();
		this.state = {
			isPostModalVisible: false,
			isApplicationsModalVisible: false
		};
	}

	_showModal = item =>
		this.setState({
			selectedPost: item,
			isPostModalVisible: true
		});

	_hideModal = () =>
		this.setState({
			isPostModalVisible: false
		});

	_showApplications = post =>
		this.setState({
			isApplicationsModalVisible: true,
			selectedPost: post
		});

	_hideApplications = () =>
		this.setState({
			isApplicationsModalVisible: false
		});

	render() {
		return (
			<View style={{ flex: 1 }}>
				<PostOrCenterModal
					isVisible={this.state.isPostModalVisible}
					post={this.state.selectedPost}
					exit={this._hideModal}
				/>

				{/* Modal to go straight to viewApplications */}
				<Modal
					isVisible={this.state.isApplicationsModalVisible}
					animationIn={'zoomIn'}
					animationOut={'zoomOut'}
				>
					<ViewApplications
						hide={this._hideApplications}
						post={this.state.selectedPost}
					/>
				</Modal>

				<BarePostList
					listData={this.props.listData}
					sortCenter={this.props.sortCenter}
					distanceCenter={this.props.distanceCenter}
					showModal={this._showModal}
					showApplications={this._showApplications}
					message={this.props.message}
				/>
			</View>
		);
	}
}
