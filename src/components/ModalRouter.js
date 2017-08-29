import { Linking, Platform, View } from 'react-native';
import React from 'react';

import Modal from 'react-native-simple-modal';
import { Route, Switch, Router } from 'react-router-native';

import ManageNotifications from './ManageNotifications';
import NewNotification from './NewNotification.js';
import PostOrCenterModal from './PostOrCenterModal';
import SingleNewsArticle from './SingleNewsArticle';
import ViewSingleApplication from './ViewSingleApplication';
import ViewApplications from './ViewApplications';
import Menu from './Menu';

export default class ModalRouter extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			currentModal: null
		};
	}

	componentDidMount() {
		global.setCurrentModal = path => {
			this.setState({ currentModal: path });
			console.log('set Current Modal to ', path);
		};
	}

	render() {
		console.log('currModal', this.state.currentModal);
		return (
			<Modal
				open={this.state.currentModal !== null}
				containerStyle={{ flex: 1 }}
				modalStyle={{ margin: 20, padding: 0 }}
				closeOnTouchOutside={false}
			>
				{/* <ManageNotifications /> */}
				<Switch location={{ pathname: this.state.currentModal }}>
					<Route path="/ManageNotifications" component={ManageNotifications} />
					<Route path="/NewNotification" component={NewNotification} />
					<Route path="/Menu" component={Menu} />
				</Switch>
			</Modal>
		);
	}
}
