import Modal from 'react-native-modal';
import React from 'react';

import ViewCenter from './ViewCenter.js';
import ViewPost from './ViewPost.js';

export default class PostOrCenterModal extends React.Component {
	constructor() {
		super();
	}

	render() {
		return (
			<Modal
				isVisible={this.props.isVisible}
				animationIn={'zoomIn'}
				animationOut={'zoomOut'}
			>
				{this.props.post && this.props.post.icon === 'center'
					? <ViewCenter hide={this.props.hide} center={this.props.post} />
					: <ViewPost hide={this.props.hide} post={this.props.post} />}
			</Modal>
		);
	}
}
