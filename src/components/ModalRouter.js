import { Route, Switch } from 'react-router-native';
import Expo from 'expo';
import Modal from 'react-native-simple-modal';
import React from 'react';

import FlagContent from './FlagContent';
import ManageNotifications from './ManageNotifications';
import NewNotification from './NewNotification.js';
import PostOrCenterModal from './PostOrCenterModal';
import SingleNewsArticle from './SingleNewsArticle';
import ViewApplications from './ViewApplications';
import ViewCenter from './ViewCenter';
import ViewPost from './ViewPost';
import ViewSingleApplication from './ViewSingleApplication';

export default class ModalRouter extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			path: null,
			params: null
		};
	}

	componentDidMount() {
		global.setCurrentModal = (path, params) => {
			// TODO log the props as well so we can see what post/application/article/
			// whatever was viewed
			const message = path
				? `Showing Modal ${path}`
				: `Hiding Modal ${this.state.path}`;
			console.log(message);
			Expo.Amplitude.logEvent(message);
			this.setState({ path: path, params: params });
		};
	}

	render() {
		return (
			<Modal
				open={this.state.path !== null}
				containerStyle={{ flex: 1 }}
				animationDuration={200}
				animationTension={0}
				modalStyle={{
					marginTop: 25,
					marginBottom: 10,
					marginHorizontal: 15,
					padding: 1.5,
					borderRadius: 5,
					backgroundColor: '#FFF'
				}}
				closeOnTouchOutside={false}
			>
				<Switch location={{ pathname: this.state.path }}>
					<Route path="/ManageNotifications" component={ManageNotifications} />
					<Route path="/NewNotification" component={NewNotification} />
					<Route
						path="/SingleNewsArticle"
						render={() => <SingleNewsArticle {...this.state.params} />}
					/>
					<Route
						path="/PostOrCenterModal"
						render={() => <PostOrCenterModal {...this.state.params} />}
					/>
					<Route
						path="/ViewApplications"
						render={() => <ViewApplications {...this.state.params} />}
					/>
					<Route
						path="/ViewSingleApplication"
						render={() => <ViewSingleApplication {...this.state.params} />}
					/>
					<Route
						path="/FlagContent"
						render={() => <FlagContent {...this.state.params} />}
					/>
				</Switch>
			</Modal>
		);
	}
}
