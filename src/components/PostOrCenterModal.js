import React from 'react';

import Modal from './Modal.js';
import ViewCenter from './ViewCenter.js';
import ViewPost from './ViewPost.js';

export default class PostOrCenterModal extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		if (this.props.isVisible) {
			if (this.props.post && this.props.post.icon === 'center') {
				global.setCurrentModal(
					'/ViewCenter',
					{ center: this.props.post },
					this.props.exit
				);
			} else {
				global.setCurrentModal(
					'/ViewPost',
					{ post: this.props.post },
					this.props.exit
				);
			}
		}
		return null;
	}
}
