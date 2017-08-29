import React from 'react';

import Modal from 'react-native-simple-modal';
import { Route, Switch } from 'react-router-native';

import ManageNotifications from './ManageNotifications';
import NewNotification from './NewNotification.js';
import ViewCenter from './ViewCenter';
import ViewPost from './ViewPost';
import SingleNewsArticle from './SingleNewsArticle';
import ViewSingleApplication from './ViewSingleApplication';
import ViewApplications from './ViewApplications';
import FlagContent from './FlagContent';

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
			this.setState({ path: path, params: params });
			console.log('set Current Modal to ', path);
		};
	}

	render() {
		return (
			<Modal
				open={this.state.path !== null}
				containerStyle={{ flex: 1 }}
				modalStyle={{
					marginTop: 20,
					marginBottom: 15,
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
						path="/ViewCenter"
						render={() => <ViewCenter {...this.state.params} />}
					/>
					<Route
						path="/ViewPost"
						render={() => <ViewPost {...this.state.params} />}
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
