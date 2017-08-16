import {
	Alert,
	Image,
	Keyboard,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import { KeyboardAwareView } from 'react-native-keyboard-aware-view';
import { FontAwesome } from '@expo/vector-icons';
import React, { Component } from 'react';
import * as firebase from 'firebase';

import {
	createApplication,
	deleteApplication
} from 'venligboerneapp/src/utils/ApplicationManager.js';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';
import Colors from 'venligboerneapp/src/styles/Colors.js';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';

import ExitBar from './ExitBar.js';
import MapWithCircle from './MapWithCircle.js';
import ShareButton from './ShareButton.js';
import Time from './Time';
import TitleAndIcon from './TitleAndIcon';
import ViewApplications from './ViewApplications.js';
import pushNotify from '../utils/pushNotify';

export default class ViewPost extends Component {
	constructor(props) {
		super(props);
		this.isOwner = this.props.post.owner === firebase.auth().currentUser.uid;
		this.state = {
			applyClicked: false
		};
		this.application = '';

		// Load the post's image and display it when it's ready
		firebase
			.database()
			.ref('images')
			.child(this.props.post.key)
			.once('value', snap => {
				if (snap.exists()) {
					this.setState({ image: snap.val() });
				}
			});

		// When the keyboard pops up, scroll the the bottom so the TextInput is visible
		this.keyboardDidShow = Keyboard.addListener(
			'keyboardDidShow',
			this._scrollToBottom
		);
		this.keyboardDidHide = Keyboard.addListener(
			'keyboardDidHide',
			this._scrollToBottom
		);
	}

	componentDidMount() {
		// Check if the user has already applied
		// This is not ideal, because it will show up at a delay
		Object.keys(this.props.post.applications).forEach(applicationKey => {
			firebase
				.database()
				.ref('applications')
				.child(applicationKey)
				.child('applicant')
				.once('value', snapshot => {
					// If there is an application by this user to this post, mark it
					if (snapshot.val() === firebase.auth().currentUser.uid) {
						this.setState({ alreadySubmitted: true });
					}
				});
		});
	}

	// Clean up the keyboard listeners on exit
	componentWillUnmount() {
		this.keyboardDidShow.remove();
		this.keyboardDidHide.remove();
	}

	_scrollToBottom = () => {
		this.scrollView.scrollToEnd({
			animated: true
		});
	};

	_applicationChange = application => {
		this.application = application;
	};

	// function: submit
	// ---------------------------------------------------------
	// Sets the user application to Applied for the event that they
	// were currently viewing
	submit = () => {
		createApplication({
			applicant: firebase.auth().currentUser.uid,
			post: this.props.post.key,
			message: this.application,
			status: 'Applied'
		});
		this.setState({ alreadySubmitted: true });

		firebase
			.database()
			.ref('users/' + this.props.post.owner + '/pushToken')
			.once('value', snap => {
				console.log('Push notifying', snap.val());
				pushNotify(snap.val(), 'New application to your event!', {
					type: 'applicationSent',
					post: this.props.post.key,
					uid: firebase.auth().currentUser.uid
				});
			});
	};

	// function: applyPressed
	// ---------------------------------------------------------
	// Either submits a user's application and updates firebase
	// accordingly or sets applyClicked to true if the user clicked
	// the 'Apply Now!' button
	_applyPressed = () => {
		if (this.state.applyClicked) {
			this.submit();
			this.props.hide();
			global.changeTab('Me', () => {
				global.profileIndex(1);
			});
		} else {
			this.setState({ applyClicked: true });
		}
	};

	// function: returnApplicationTextbox
	// ---------------------------------------------------------
	// Returns the a textbox in which a user can write a note
	// to the event owner
	returnApplicationTextbox = () => {
		return (
			<TextInput
				style={
					!this.state.alreadySubmitted
						? [styles.placeholderText, styles.textInput]
						: styles.textInputSubmitted
				}
				autoFocus={true}
				onChangeText={this._applicationChange}
				editable={!this.state.alreadySubmitted}
				multiline={true}
				blurOnSubmit={true}
				returnKeyType="done"
				placeholder={translate('Enter Message To Event Owner...')}
			/>
		);
	};

	// Sends the user to the my applications tab
	_viewApplication = () => {
		// TODO open the specific application
		this.props.hide();
		global.changeTab('Me', () => {
			global.profileIndex(1);
		});
	};

	// function: returnApplyButton
	// ---------------------------------------------------------
	// Returns a button which tells the user to either apply or Submit
	// an application if they are not the event owner or to view the
	// available applications if they own the event
	returnApplyButton = () => {
		if (this.state.alreadySubmitted) {
			return (
				<TouchableOpacity
					style={styles.applyButton}
					onPress={this._viewApplication}
				>
					<Text style={styles.applyText}>
						{translate('View My Application')}
					</Text>
				</TouchableOpacity>
			);
		} else {
			const numApplications = Object.keys(this.props.post.applications).length;
			return (
				<TouchableOpacity
					style={styles.applyButton}
					onPress={this._applyPressed}
				>
					<Text style={styles.applyText}>
						{this.isOwner
							? translate('View Applicants') + ` (${numApplications})`
							: translate(
									this.state.applyClicked ? 'Submit Application' : 'Apply Now!'
								)}
					</Text>
				</TouchableOpacity>
			);
		}
	};

	_editItem = () => {
		// You must change to the New Post tab first so that
		// global.editPost is initialized
		global.changeTab('New Post', () => {
			global.editPost(this.props.post);
		});
		this.props.hide();
	};

	_deleteItem = () => {
		console.log('Attempting to delete item');
		Alert.alert(
			translate('Are you sure you want to remove this post?'),
			translate('This cannot be undone'),
			[
				{ text: translate('No') },
				{ text: translate('Yes'), onPress: this._deletePost }
			],
			{ cancelable: false }
		);
	};

	_deletePost = () => {
		// Delete all the applications to this post
		Object.keys(this.props.post.applications).forEach(async applicationKey => {
			const applicant = await firebase
				.database()
				.ref('applications')
				.child(applicationKey)
				.child('applicant')
				.once('value');
			deleteApplication({
				key: applicationKey,
				applicant: applicant.val(),
				post: this.props.post.key
			});
		});

		// TODO make this atomic with an update
		firebase.database().ref('posts').child(this.props.post.key).remove();

		this.props.hide();
	};

	render() {
		return this.isOwner && this.state.applyClicked
			? <ViewApplications hide={this.props.hide} post={this.props.post} />
			: <KeyboardAwareView style={{ backgroundColor: 'white' }}>
					{/* Share icon */}
					<ShareButton
						deepLink={'post/' + this.props.post.key}
						description={this.props.post.description}
						title={this.props.post.title}
					/>

					<ExitBar hide={this.props.hide} />

					<ScrollView
						ref={scrollView => {
							this.scrollView = scrollView;
						}}
					>
						<View style={styles.container}>
							<TitleAndIcon post={this.props.post} />

							{/* Edit and delete buttons */}
							{this.isOwner
								? <View style={styles.editDeleteContainer}>
										<TouchableOpacity
											onPress={this._editItem}
											style={styles.editDelete}
										>
											<FontAwesome name={'edit'} size={35} />
										</TouchableOpacity>
										<TouchableOpacity
											onPress={this._deleteItem}
											style={styles.editDelete}
										>
											<FontAwesome name={'trash-o'} size={32} />
										</TouchableOpacity>
									</View>
								: null}

							<View style={[SharedStyles.divider, { marginTop: 10 }]} />

							<Time
								style={styles.dataRow}
								datetime={this.props.post.datetime}
							/>

							<View style={SharedStyles.divider} />

							<View style={styles.dataRow}>
								<Text style={styles.description}>
									{this.props.post.description}
								</Text>
							</View>

							<View style={SharedStyles.divider} />

							{/*Display selected image*/}
							{this.state.image
								? <View>
										<Image
											source={{ uri: this.state.image }}
											style={styles.imageUpload}
										/>
									</View>
								: null}

							{/*Image renders after divider so this is the only way to ensure
							that there arent double dividers*/}
							{this.props.post.image
								? <View style={SharedStyles.divider} />
								: null}

							{/* Map or application text*/}
							{this.state.applyClicked
								? this.returnApplicationTextbox()
								: <MapWithCircle
										latitude={this.props.post.latitude}
										longitude={this.props.post.longitude}
									/>}
						</View>
					</ScrollView>
					<View style={SharedStyles.fixedBottomButton}>
						{this.returnApplyButton()}
					</View>
				</KeyboardAwareView>;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center'
	},
	editDeleteContainer: {
		flex: 1,
		width: '85%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingTop: 10,
		borderTopWidth: 1,
		borderColor: Colors.grey.medium
	},
	editDelete: {
		backgroundColor: Colors.grey.light,
		width: 100,
		paddingVertical: 5,
		borderRadius: 10,
		flexDirection: 'row',

		justifyContent: 'center'
	},
	dataRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		width: '100%',
		alignItems: 'center'
	},
	description: {
		textAlign: 'center',
		color: 'black',
		margin: 15,
		fontSize: 15,
		alignSelf: 'center'
	},
	imageUpload: {
		width: 200,
		height: 200,
		margin: 20,
		alignSelf: 'center'
	},
	textInput: {
		height: 250,
		backgroundColor: 'white',
		alignSelf: 'stretch',
		fontSize: 18,
		margin: 15,
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.grey.dark,
		borderRadius: 10
	},
	textInputSubmitted: {
		height: 250,
		alignSelf: 'stretch',
		backgroundColor: 'white',
		fontSize: 18,
		margin: 15,
		padding: 10
	},
	placeholderText: {
		height: 140,
		textAlignVertical: 'top'
	},
	applyButton: {
		backgroundColor: '#658bcd',
		borderRadius: 10,
		paddingTop: 8,
		paddingBottom: 8,
		width: '80%',
		alignItems: 'center',
		alignSelf: 'center'
	},
	applyText: {
		color: 'white'
	}
});
