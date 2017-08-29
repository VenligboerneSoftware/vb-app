import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import Modal from './Modal.js';
import React from 'react';
import firebase from 'firebase';

import { translate } from 'venligboerneapp/src/utils/internationalization.js';

import ApplicationStatus from './ApplicationStatus';
import Colors from '../styles/Colors';
import EventIcon from './EventIcon';
import SharedStyles from '../styles/SharedStyles';
import ViewSingleApplication from './ViewSingleApplication';

export default class MyApplications extends React.Component {
	constructor() {
		super();
		this.state = {
			isModalVisible: false,
			selectedApp: null,
			applications: {}
		};
		this._loadApplications();
	}

	/**
	 * @param {String} applicationKey The unique database key which identifies the application
	 * @returns {Object} Returns the data about the application, the post it is
	 * for, and if it is accepted, the post's owner.
	 */
	_getApplicationByKey = async applicationKey => {
		let application = (await firebase
			.database()
			.ref('applications')
			.child(applicationKey)
			.once('value')).val();
		application.key = applicationKey;

		// Listen for application status changes
		const ref = firebase
			.database()
			.ref('applications')
			.child(applicationKey)
			.child('status');
		const callback = ref.on('value', snap => {
			if (
				snap.exists() &&
				this.applications &&
				this.applications[applicationKey]
			) {
				this.applications[applicationKey].status = snap.val();
				this.setState({
					applications: this.applications
				});
			}
		});
		// Store the on listener so it can be removed later
		application.removeListener = () => {
			ref.off('value', callback);
		};

		// Get the information about the original post
		application.postData = (await firebase
			.database()
			.ref('posts')
			.child(application.post)
			.once('value')).val();
		// Default to an empty object if there are no applications
		application.postData.applications = application.postData.applications || {};

		// If the application was accepted, fetch the owner's info so we can display
		// the contact button
		if (application.status === 'Accepted') {
			application.owner = (await firebase
				.database()
				.ref('users')
				.child(application.postData.owner)
				.once('value')).val();
		}
		return application;
	};

	/**
	 * Callback function for Array.sort which alphabetizes elements by their status.
	 * @param {Object} obj1 The first object
	 * @param {Object} obj2 The second object
	 * @returns {Number} 1, -1, or 0 depending on how the two elements compare
	 */
	_alphabetize = (obj1, obj2) => {
		if (obj1.status > obj2.status) {
			return 1;
		} else if (obj1.status < obj2.status) {
			return -1;
		} else {
			return 0;
		}
	};

	_loadApplications = () => {
		// Get the list of all the applications owned by this user
		firebase
			.database()
			.ref('users')
			.child(firebase.auth().currentUser.uid)
			.child('applications')
			.on('value', applicationKeys => {
				// Remove all of the status change listeners
				Object.values(this.state.applications).forEach(app => {
					app.removeListener();
				});

				applicationKeys = applicationKeys.val() || {};

				// Load all of the peripheral data about the applications
				Promise.all(
					Object.keys(applicationKeys).map(this._getApplicationByKey)
				).then(applications => {
					applications.forEach(app => {
						applicationKeys[app.key] = app;
					});
					// Once it is loaded, sort it and set the state
					this.applications = applicationKeys;
					this.setState({ applications: this.applications });
				});
			});
	};

	_showPostModal = item =>
		this.setState({ selectedApp: item, isModalVisible: true });

	_hideModal = () => this.setState({ isModalVisible: false });

	render() {
		if (this.state.isModalVisible) {
			global.setCurrentModal('/ViewSingleApplication', {
				app: this.state.selectedApp,
				exit: this._hideModal
			});
		}
		return (
			<View style={styles.container}>
				{Object.values(this.state.applications).length > 0
					? <FlatList
							data={Object.values(this.state.applications).sort(
								this._alphabetize
							)}
							ItemSeparatorComponent={() =>
								<View style={SharedStyles.divider} />}
							renderItem={({ item }) =>
								<TouchableOpacity
									style={styles.appRow}
									key={item.key}
									onPress={() => {
										this._showPostModal(item);
									}}
								>
									<EventIcon item={item.postData} />

									<View style={styles.appInfo}>
										<Text style={styles.title}>
											{item.postData.title}
										</Text>

										<ApplicationStatus status={item.status} modal={false} />

										<Text style={styles.message}>
											{translate('Your Reply') + ':'} {item.message}
										</Text>
									</View>
								</TouchableOpacity>}
						/>
					: <View style={styles.empty}>
							<Text>
								{translate('You have not replied to any posts.')}
							</Text>
						</View>}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		padding: 0,
		backgroundColor: 'white'
	},
	appRow: {
		flexDirection: 'row',
		margin: 10,
		paddingTop: 0,
		paddingBottom: 0,
		flex: 1
	},
	appInfo: {
		flexDirection: 'column',
		flex: 1
	},
	title: {
		fontSize: 20,
		width: '90%'
	},
	message: {
		marginTop: 7,
		color: Colors.grey.dark,
		width: '90%'
	},
	empty: {
		alignItems: 'center',
		marginTop: 10
	}
});
