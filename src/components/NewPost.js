import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Expo, { ImagePicker } from 'expo';
import React from 'react';
import * as firebase from 'firebase';

import { FontAwesome } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';
import Colors from 'venligboerneapp/src/styles/Colors.js';
import Moment from 'moment';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';

import { bundleTranslations } from '../utils/internationalization';
import { formatDate } from '../utils/dates';
import MapWithCircle from './MapWithCircle.js';
import Modal from './Modal.js';
import SearchLocation from './SearchLocation.js';
import TopBar from './TopBar.js';
import mortonize from '../utils/mortonize';
import pushNotify from '../utils/pushNotify';

const initialState = {
	newPost: {},
	datepickerVisible: false,
	searchModalVisible: false,
	base64: null,
	location: null,
	uploadingPost: false,
	exactLocation: null
};

export default class NewPost extends React.Component {
	constructor(props) {
		super(props);

		this.state = initialState;

		// Make the resolve function externally accessible so it can be Called
		// in the onLayout of renderRemaining.
		const _this = this;
		this.onScroll = new Promise((resolve, reject) => {
			_this.onLayout = {
				resolve: resolve,
				reject: reject
			};
		});

		global.editPost = post => {
			// duplicate to avoid modifying parameter
			post = JSON.parse(JSON.stringify(post));

			post.title = post.title.original;
			post.description = post.description.original;
			this.setState({
				...initialState,
				newPost: post,
				exactLocation: post.exactLocation
			});
			firebase.database().ref('images').child(post.key).once('value', snap => {
				if (snap.exists()) {
					this.setState({ base64: snap.val() });
				}
			});

			//TODO: set state of exactLocation
		};
	}

	clearState() {
		console.log('clearing state');
		this.setState(initialState);
	}

	/* _onIconPressed
  --------------------------------------------------
  Stores the selected icon and scrolls down to the rest of the form. */
	_onIconPressed = icon => {
		this.setState({ newPost: { ...this.state.newPost, icon: icon } }, () => {
			// When the user clicks an icon scroll down automatically
			// Use .then to wait for the lower half to be laid out
			this.onScroll.then(y => {
				this.scrollView.scrollTo({
					x: 0,
					y: y,
					animated: true
				});
			});
		});
	};

	/* _titleChange
  --------------------------------------------------
  Stores the title in the state.  Called from title TextInput onChangeText*/
	_titleChange = title => {
		this.setState({ newPost: { ...this.state.newPost, title: title } });
	};

	/* _descriptionChange
  --------------------------------------------------
  Stores the description in the state.  Called from description TextInput onChangeText*/
	_descriptionChange = description => {
		this.setState({
			newPost: { ...this.state.newPost, description: description }
		});
	};

	/* _onDateSelected
  --------------------------------------------------
  Stores the selected dates in the state.  Called from datepicker */
	_onDateSelected = date => {
		const datetime = new Date(date.timestamp).getTime();

		const dateIndex = this.state.newPost.dates //-1 if not yet in array
			? this.state.newPost.dates.indexOf(datetime)
			: -1;

		//adds date if not present, removes if present, creates new array if
		//dates doesn't yet exist
		const dates = this.state.newPost.dates
			? dateIndex === -1
				? [...this.state.newPost.dates, datetime]
				: this.state.newPost.dates.filter((value, arrIndex) => {
						return dateIndex !== arrIndex;
					})
			: [datetime];
		this.setState({
			newPost: {
				...this.state.newPost,
				dates: dates
			}
		});
	};

	//converts an array of datetimes into an object of format {"yyyy-mm-dd"}
	//for use by the Calendar component
	_getSelectedDates = () => {
		let dates = this.state.newPost.dates
			? this.state.newPost.dates.reduce((obj, date) => {
					date = Moment(date).utc().format('YYYY-MM-DD');
					obj[date] = { selected: true };
					return obj;
				}, {})
			: null;
		return dates;
	};

	_calendarDonePressed = () => {
		this.setState({
			datepickerVisible: false
		});
	};

	// _addNoise
	// --------------------------------------------------------------------------
	// Adds noise to the given latitude and longitude such that the result is
	// uniformly distributed in a square of radius *distance* (in meters) around
	// the initial point.
	_addNoise(latitude, longitude, distance) {
		// the maximum noise distance in degrees latitude
		const latitudeMaxNoise = distance / 4e7 * 360;
		// the maximum noise distance in degrees longitude
		const longitudeMaxNoise = latitudeMaxNoise / Math.cos(latitude);
		return {
			latitude: latitude + (Math.random() * 2 - 1) * latitudeMaxNoise,
			longitude: longitude + (Math.random() * 2 - 1) * longitudeMaxNoise
		};
	}

	// _onSearchLocation
	// ---------------------------------------------------------------------------
	// Triggered when the user selects a location from the address picker.
	_onSearchLocation = (data, details) => {
		Alert.alert(
			// translate('Are you sure you want to accept?'),
			// translate('This person will be able to view your Facebook Profile'),
			translate('Hide exact location?'),
			translate(
				'This post will appear somewhere within 1 kilometer of the location you select, to protect your privacy.'
			),
			[
				{
					text: translate('No'),
					onPress: () => {
						this.setState({
							searchModalVisible: false,
							exactLocation: true,
							newPost: {
								...this.state.newPost,
								latitude: details.geometry.location.lat,
								longitude: details.geometry.location.lng,
								// Current location has an undefined formatted_address, so set it
								// to the description 'Current location' (firebase doesn't like undefined)
								formatted_address:
									details.formatted_address || details.description
							}
						});
					}
				},
				{
					text: translate('Yes'),
					onPress: () => {
						this.setState({
							searchModalVisible: false,
							exactLocation: false,
							newPost: {
								...this.state.newPost,
								...this._addNoise(
									details.geometry.location.lat,
									details.geometry.location.lng,
									1000
								),
								// Current location has an undefined formatted_address, so set it
								// to the description 'Current location' (firebase doesn't like undefined)
								formatted_address:
									details.formatted_address || details.description
							}
						});
					}
				}
			],
			{ cancelable: false }
		);
	};

	_pickPhoto = async pickMethod => {
		// pickMethod is expected to be one of
		// Expo.ImagePicker.launchCameraAsync or Expo.ImagePicker.launchImageLibraryAsync
		// https://docs.expo.io/versions/v15.0.0/sdk/imagepicker.html
		const result = await pickMethod({
			base64: true
		});

		if (!result.cancelled) {
			// Let the user see a preview
			// https://docs.expo.io/versions/latest/sdk/imagepicker.html
			console.log('Setting base64', result.base64.length);
			this.setState({
				base64: 'data:image/jpg;base64,' + result.base64
			});
		}
	};

	/* _renderIcon
  --------------------------------------------------
  Renders an icon in the icon list */
	_renderIcon = ({ item }) => {
		const isSelected = this.state.newPost.icon === item.key;
		return (
			<TouchableOpacity
				onPress={this._onIconPressed.bind(this, item.key)}
				style={[
					{
						backgroundColor: isSelected ? Colors.blue.light : Colors.grey.light
					},
					styles.iconButton
				]}
			>
				<Text
					style={[
						{ color: isSelected ? Colors.blue.dark : Colors.grey.dark },
						styles.iconText
					]}
				>
					{translate(item.title)}
				</Text>
				<Image
					style={[
						{ tintColor: isSelected ? Colors.blue.dark : Colors.grey.dark },
						styles.iconImage
					]}
					source={{ uri: item.iconURL }}
				/>
			</TouchableOpacity>
		);
	};

	/* _submitPressed
  --------------------------------------------------
  Checks all required fields and adds the item to FireBase */
	_submitPressed = async () => {
		// Check that all of the mandatory fields are filled out
		// TODO maybe scroll to/highlight the relevant component
		if (!this.state.newPost.icon) {
			Alert.alert(translate('Please select a category'));
			return;
		}
		if (!this.state.newPost.title) {
			Alert.alert(translate('Please enter a title'));
			return;
		}
		if (!this.state.newPost.description) {
			Alert.alert(translate('Please enter a description'));
			return;
		}
		if (!this.state.newPost.latitude || !this.state.newPost.longitude) {
			Alert.alert(translate('Please select a location'));
			return;
		}
		if (this.state.exactLocation === null) {
			Alert.alert('Please reselect a location');
			return;
		}

		if (!this.state.uploadingPost) {
			//submit to firebase
			this.setState({ uploadingPost: true });
			const ref = firebase.database().ref('posts');

			const newPost = {
				...this.state.newPost,
				index: mortonize(
					this.state.newPost.latitude,
					this.state.newPost.longitude
				),
				creationTime: Date.now(),
				owner: firebase.auth().currentUser.uid,
				exactLocation: this.state.exactLocation
			};

			newPost.title = await bundleTranslations(newPost.title);
			newPost.description = await bundleTranslations(newPost.description);

			// If we are editing, then overwrite the old index. If we are creating
			// a new post, push a new entry to the database.
			let eventKey = null;
			if (newPost.key) {
				// if the key is present, we are editing

				// This is fancy Babel syntax. newPost.key is put into the key constant
				// and the other properties are put into uploadableEvent.
				// https://stackoverflow.com/questions/34698905/clone-a-js-object-except-for-one-key
				const { key, ...uploadableEvent } = newPost;
				eventKey = key;
				ref.child(eventKey).update(uploadableEvent);
				console.log('Updating post', newPost, eventKey);
			} else {
				const pushRef = ref.push(newPost);
				eventKey = pushRef.key;
				pushRef.then(() => {
					this._notifySubscribers(newPost, eventKey);
				});
			}

			// Upload the image to Firebase under the same ID as the post
			firebase.database().ref('images').child(eventKey).set(this.state.base64);

			// Switch to MapViewPage and zoom in to new event
			global.changeTab('Map', () => {
				global.setRegion({
					latitude: newPost.latitude,
					longitude: newPost.longitude,
					latitudeDelta: 0.05,
					longitudeDelta: 0.05
				});
			});

			Expo.Amplitude.logEvent(
				`Post Created in Category ${this.state.newPost.icon}`
			);
		}
	};

	_notifySubscribers = async (event, eventKey) => {
		try {
			const response = await fetch(
				'https://us-central1-test-b5dbd.cloudfunctions.net/getSubscribers',
				{
					method: 'POST',
					body: JSON.stringify({
						post: event,
						userID: firebase.auth().currentUser.uid
					})
				}
			);
			const parsedResponse = await response.json();
			console.log('subscribers to notify', parsedResponse);
			// TODO translate depending on receivers language
			pushNotify(
				parsedResponse,
				'New Post In Your Area!',
				event.title.original,
				{
					url: '+post/' + eventKey
				}
			);
		} catch (error) {
			console.warn('Error while getting relevant subscribers', error);
		}
	};

	//removes selected date from state
	_cancelDate = () => {
		this.setState({
			datepickerVisible: false,
			newPost: { ...this.state.newPost, dates: null }
		});
	};

	//removes selected photo from state
	_cancelPhoto = () => {
		this.setState({
			base64: null
		});
	};

	renderRemaining = () =>
		<View
			onLayout={event => {
				this.onLayout.resolve(event.nativeEvent.layout.y);
			}}
		>
			<Text style={{ color: Colors.red, alignSelf: 'center' }}>
				*{translate('required field')}
			</Text>

			<View>
				{/* Enter Title */}
				<View style={styles.horizontalLayout}>
					<TextInput
						ref={titleInput => {
							this.titleInput = titleInput;
						}}
						style={[styles.title, styles.textInput]}
						onChangeText={this._titleChange}
						defaultValue={this.state.newPost.title}
						multiline={false}
						maxLength={45}
						returnKeyType="done"
						blurOnSubmit={true}
						autoCapitalize={'sentences'}
						placeholder={translate('Enter Post Title Here...')}
						onSubmitEditing={event => {
							this.descriptionInput.focus();
						}}
					/>
					<FontAwesome name={'asterisk'} size={6} style={styles.asterisk} />
				</View>

				{/* Enter Description */}
				<View style={styles.horizontalLayout}>
					<TextInput
						ref={descriptionInput => {
							this.descriptionInput = descriptionInput;
						}}
						style={[styles.description, styles.textInput]}
						onChangeText={this._descriptionChange}
						defaultValue={this.state.newPost.description}
						multiline={true}
						blurOnSubmit={true}
						returnKeyType="done"
						placeholder={translate('Enter Post Description Here...')}
					/>
					<FontAwesome name={'asterisk'} size={6} style={styles.asterisk} />
				</View>
			</View>

			{/* Search Bar */}
			<View style={styles.horizontalLayout}>
				<TouchableOpacity
					style={styles.searchBar}
					activeOpacity={0.4}
					onPress={() => {
						this.setState({ searchModalVisible: true });
					}}
				>
					<FontAwesome name={'map-marker'} size={22} style={styles.pinIcon} />
					<Text style={{ backgroundColor: 'transparent', width: '80%' }}>
						{this.state.newPost.formatted_address
							? this.state.newPost.formatted_address
							: translate('Select Event Location')}
					</Text>

					<Modal
						visible={this.state.searchModalVisible}
						style={SharedStyles.fullscreen}
					>
						<SearchLocation
							onPress={this._onSearchLocation}
							hide={() => {
								this.setState({ searchModalVisible: false });
							}}
						/>
					</Modal>
				</TouchableOpacity>
				<FontAwesome name={'asterisk'} size={6} style={styles.asterisk} />
			</View>

			<Text
				style={{
					textAlign: 'center',
					backgroundColor: 'white',
					margin: 10,
					marginBottom: 0,
					marginTop: 20
				}}
			>
				{translate(
					'This post will appear somewhere within 1 kilometer of the location you select, to protect your privacy.'
				)}
			</Text>

			{/*Display selected location*/}
			{this.state.newPost.latitude && this.state.newPost.longitude
				? <MapWithCircle
						latitude={this.state.newPost.latitude}
						longitude={this.state.newPost.longitude}
					/>
				: null}

			{/* Date Picker */}
			<View style={styles.horizontalLayout}>
				<TouchableOpacity
					style={styles.datetime}
					activeOpacity={0.4}
					onPress={() =>
						this.setState({
							datepickerVisible: !this.state.datepickerVisible
						})}
				>
					<FontAwesome name={'calendar'} size={22} style={styles.pinIcon} />
					{this.state.newPost.dates && this.state.newPost.dates.length !== 0
						? <View>
								<Text>
									{this.state.newPost.dates.map(date => {
										return formatDate(date) + ' ';
									})}
								</Text>
							</View>
						: <Text>
								{this.state.datepickerVisible
									? translate('Choose Date Below')
									: translate('Optional Date')}
							</Text>}
				</TouchableOpacity>
				{/* cancel button */}
				{this.state.newPost.dates && this.state.newPost.dates.length !== 0
					? <TouchableOpacity
							style={{ paddingTop: 10, paddingRight: 15 }}
							onPress={this._cancelDate}
						>
							<FontAwesome name="times" size={30} />
						</TouchableOpacity>
					: null}
			</View>
			{/* Date Picker */}
			{this.state.datepickerVisible
				? <View>
						<Calendar
							minDate={Moment.now()}
							onDayPress={this._onDateSelected}
							monthFormat={'MMM yyyy'}
							hideArrows={false}
							hideExtraDays={true}
							disableMonthChange={false}
							firstDay={1} //Monday comes first
							markedDates={this._getSelectedDates()}
							theme={{
								calendarBackground: '#ffffff',
								textSectionTitleColor: '#b6c1cd',
								selectedDayBackgroundColor: '#00adf5',
								selectedDayTextColor: '#ffffff',
								todayTextColor: '#00adf5',
								dayTextColor: '#2d4150',
								textDisabledColor: '#d9e1e8',
								textMonthFontSize: 16
							}}
						/>

						<TouchableOpacity
							style={{
								backgroundColor: Colors.grey.medium,
								paddingVertical: 10
							}}
							onPress={() => this._calendarDonePressed()}
						>
							<Text
								style={{ fontSize: 16, color: 'black', alignSelf: 'center' }}
							>
								{!this.state.newPost.dates ||
								this.state.newPost.dates.length <= 1
									? translate('Select Date')
									: translate('Select Dates')}
							</Text>
						</TouchableOpacity>
					</View>
				: null}

			{/* Photo Selection */}
			<View style={styles.cameraContainer}>
				<TouchableOpacity
					style={styles.camera}
					activeOpacity={0.4}
					onPress={this._pickPhoto.bind(this, ImagePicker.launchCameraAsync)}
				>
					<FontAwesome name={'camera'} size={44} />
					<Text style={{ fontSize: 15 }}>
						{translate('Take a Picture')}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.camera}
					activeOpacity={0.4}
					onPress={this._pickPhoto.bind(
						this,
						ImagePicker.launchImageLibraryAsync
					)}
				>
					<FontAwesome name={'photo'} size={44} />
					<Text style={{ fontSize: 15 }}>
						{translate('Select a Picture')}
					</Text>
				</TouchableOpacity>
			</View>

			{/*Display selected image*/}
			{this.state.base64
				? <View style={styles.horizontalLayout}>
						<Image
							source={{ uri: this.state.base64 }}
							style={{
								width: '40%',
								height: 150,
								resizeMode: 'contain',
								alignSelf: 'center'
							}}
						/>
						{/* Cancel button */}
						<TouchableOpacity
							style={{
								backgroundColor: '#F95F62',
								padding: 15,
								borderRadius: 10,
								marginLeft: 25
							}}
							onPress={this._cancelPhoto}
						>
							<Text style={{ color: 'white' }}>
								{translate('Remove Photo')}
							</Text>
						</TouchableOpacity>
					</View>
				: null}

			{/* Submit Button */}
			<TouchableOpacity
				style={SharedStyles.finishButton}
				activeOpacity={0.4}
				onPress={this._submitPressed}
			>
				{this.state.uploadingPost
					? <ActivityIndicator
							animating={true}
							size={'large'}
							style={{ marginVertical: 10 }}
							color={'white'}
						/>
					: <Text style={{ color: Colors.white, fontSize: 30 }}>
							{translate('Finish')}
						</Text>}
			</TouchableOpacity>
		</View>;

	render() {
		return (
			<View style={styles.container}>
				<TopBar
					title={translate(this.state.newPost.key ? 'Edit Post' : 'New Post')}
				/>
				<ScrollView
					ref={scrollView => {
						this.scrollView = scrollView;
					}}
					keyboardDismissMode={'on-drag'}
					keyboardShouldPersistTaps={'handled'}
				>
					<View style={[styles.horizontalLayout, { marginTop: 5 }]}>
						<Text style={{ fontSize: 16 }}>
							{translate('Choose a Category')}
						</Text>
						<FontAwesome name={'asterisk'} size={6} style={styles.asterisk} />
					</View>

					{/* List of icons */}
					<FlatList
						style={styles.list}
						data={Object.values(global.db.categories)
							.filter(icon => icon.key !== 'center')
							.sort((a, b) => a.order - b.order)}
						numColumns={2}
						scrollEnabled={false}
						renderItem={this._renderIcon}
					/>
					{this.state.newPost.icon ? this.renderRemaining() : null}
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		padding: 0,
		backgroundColor: Colors.white
	},
	list: {
		padding: 10
	},
	iconButton: {
		width: '48%',
		margin: '1%',
		height: 90,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		padding: 10
	},
	iconText: {
		width: '65%',
		fontSize: 16
	},
	iconImage: {
		width: '35%',
		height: '100%',
		resizeMode: 'contain'
	},
	textInput: {
		flex: 1,
		backgroundColor: Colors.white,
		fontSize: 18,
		marginLeft: 20,
		marginBottom: 10,
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.grey.dark,
		borderRadius: 10
	},
	description: {
		height: 140,
		textAlignVertical: 'top'
	},
	title: {
		height: 40
	},
	searchBar: {
		flex: 1,
		marginLeft: 20,
		height: 40,
		alignSelf: 'center',
		backgroundColor: Colors.grey.light,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10
	},
	pinIcon: {
		marginLeft: 5,
		marginRight: 10
	},
	cameraContainer: {
		marginTop: 15,
		marginBottom: 15,
		marginLeft: 20,
		marginRight: 25,
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	datetime: {
		flex: 1,
		padding: 15,
		marginLeft: 20,
		marginRight: 25,
		backgroundColor: Colors.grey.light,
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignSelf: 'center',
		marginTop: 15
	},
	camera: {
		width: '45%',
		height: 100,
		alignSelf: 'center',
		backgroundColor: Colors.grey.light,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10
	},
	horizontalLayout: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	asterisk: {
		color: Colors.red,
		marginRight: 20,
		alignSelf: 'flex-start'
	}
});
