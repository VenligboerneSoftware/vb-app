import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import React from 'react';
import firebase from 'firebase';

import {
	translate,
	translateFreeform
} from 'venligboerneapp/src/utils/internationalization.js';

import ApplicationStatus from './ApplicationStatus';
import Colors from '../styles/Colors';
import EventIcon from './EventIcon';
import Modal from './Modal.js';
import SharedStyles from '../styles/SharedStyles';

export default class MyApplications extends React.Component {
	constructor() {
		super();
		this.state = {
			applications: {},
			applicationsLoaded: false
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
		const ref = firebase.database().ref('applications').child(applicationKey);
		const callback = ref.on('value', snap => {
			if (
				snap.exists() &&
				this.applications &&
				this.applications[applicationKey]
			) {
				this.applications[applicationKey].status = snap.val().status;
				this.applications[applicationKey].bold = snap.val().bold; //make sure right
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
	 * Callback function for Array.sort which sorts elements by their status.
	 * @param {Object} obj1 The first object
	 * @param {Object} obj2 The second object
	 * @returns {Number} 1, -1, or 0 depending on how the two elements compare
	 */
	_sort = (obj1, obj2) => {
		if (obj1.status === obj2.status) {
			return 0;
		} else if (obj1.status === 'Accepted' || obj2.status === 'Rejected') {
			return -1;
		} else {
			return 1;
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
					this.setState({
						applications: this.applications,
						applicationsLoaded: true
					});
				});
			});
	};

	_showPostModal = item =>
		global.setCurrentModal('/ViewSingleApplication', {
			app: item
		});

	render() {
		return (
			<View style={styles.container}>
				{this.state.applicationsLoaded
					? Object.values(this.state.applications).length > 0
						? <FlatList
								data={Object.values(this.state.applications).sort(this._sort)}
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
											<Text
												style={
													item.bold === true ? styles.boldTitle : styles.title
												}
											>
												{translateFreeform(item.postData.title)}
											</Text>

											<ApplicationStatus
												status={item.status}
												modal={false}
												bold={item.bold}
											/>

											<Text style={styles.message}>
												{translate('Your Reply') + ': '}
												{translateFreeform(item.message)}
											</Text>
										</View>
									</TouchableOpacity>}
							/>
						: <View style={styles.empty}>
								<Text>
									{translate('You have not replied to any posts.')}
								</Text>
							</View>
					: <ActivityIndicator
							animating={true}
							size={'large'}
							style={{ marginTop: 10 }}
						/>}
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
	},
	boldTitle: {
		fontSize: 20,
		width: '90%',
		fontWeight: 'bold'
	}
});
