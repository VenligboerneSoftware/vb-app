import React from 'react';

import ViewCenter from './ViewCenter.js';
import ViewPost from './ViewPost.js';

export default class PostOrCenterModal extends React.Component {
	render() {
		if (this.props.post.icon === 'center') {
			return <ViewCenter center={this.props.post} />;
		} else {
			return <ViewPost post={this.props.post} />;
		}
	}
}
