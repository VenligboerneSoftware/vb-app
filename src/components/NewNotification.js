import React from 'react';
import {
	StyleSheet,
	FlatList,
	Text,
	View,
	TouchableOpacity,
	Image,
	ScrollView,
	Alert,
	Picker,
	I18nManager
} from 'react-native';
import ExitBar from './ExitBar';
import Colors from '../styles/Colors';
import * as firebase from 'firebase';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';
import Modal from 'react-native-modal';
import SearchLocation from './SearchLocation.js';

import { FontAwesome, Entypo, Ionicons } from '@expo/vector-icons';

export default class NewNotification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newSubscription: {
				owner: firebase.auth().currentUser.uid,
				radius: 10
			},
			searchModalVisible: false
		};
	}

	// _onSearchLocation
	// ---------------------------------------------------------------------------
	// Triggered when the user selects a location from the address picker.
	_onSearchLocation = (data, details) => {
		this.setState({
			searchModalVisible: false,
			newSubscription: {
				...this.state.newSubscription,
				latitude: details.geometry.location.lat,
				longitude: details.geometry.location.lng,
				// Current location has an undefined formatted_address, so set it
				// to the description 'Current location' (firebase doesn't like undefined)
				formatted_address: details.formatted_address || details.description
			}
		});
	};

	// _renderIcon
	// ---------------------------------------------------------------------------
	// Renders the icons for categories with image, text, and color depending on
	// selection status
	_renderIcon = ({ item }) => {
		const isSelected = this.state.newSubscription.icon === item.key;
		return (
			<TouchableOpacity
				onPress={() =>
					this.setState({
						newSubscription: {
							...this.state.newSubscription,
							icon: item.key,
							iconText: item.title
						}
					})}
				style={[
					{
						backgroundColor: isSelected ? Colors.blue.light : Colors.grey.light
					},
					styles.iconButton
				]}
			>
				<Image
					style={[
						{ tintColor: isSelected ? Colors.blue.dark : Colors.grey.dark },
						styles.iconImage
					]}
					source={{ uri: item.iconURL }}
				/>
				<Text
					style={[
						{ color: isSelected ? Colors.blue.dark : Colors.grey.dark },
						styles.iconText
					]}
				>
					{translate(item.title)}
				</Text>
			</TouchableOpacity>
		);
	};

	// _setRadius
	// ---------------------------------------------------------------------------
	// Sets the radius on completion of slider
	_setRadius = num => {
		this.setState({
			newSubscription: {
				...this.state.newSubscription,
				radius: num
			}
		});
	};

	// _submitPressed
	// ---------------------------------------------------------------------------
	// Checks all required fields and adds the subscription to FireBase */
	_submitPressed = () => {
		if (!this.state.newSubscription.icon) {
			alert(translate('Please select a category'));
			return;
		}
		if (
			!this.state.newSubscription.latitude ||
			!this.state.newSubscription.longitude
		) {
			alert(translate('Please select a location'));
			return;
		}
		if (!this.state.newSubscription.radius) {
			alert(translate('Please select a distance'));
			return;
		}

		Alert.alert(
			'Ready?',
			'Category: ' +
				this.state.newSubscription.iconText +
				'\n' +
				this.state.newSubscription.formatted_address +
				'\n' +
				'Distance: ' +
				this.state.newSubscription.radius +
				' km',
			[
				{
					text: 'Cancel',
					onPress: () => console.log('Cancel Pressed'),
					style: 'cancel'
				},
				{
					text: 'Submit',
					onPress: () => {
						// TODO: Add to firebase and translate text once we decide wording is right
						firebase
							.database()
							.ref('subscriptions')
							.push(this.state.newSubscription);
						this.props.back();
					}
				}
			]
		);
	};

	render() {
		return (
			<View style={styles.container}>
				<TouchableOpacity onPress={this.props.back} style={SharedStyles.back}>
					<Ionicons
						name={I18nManager.isRTL ? 'ios-arrow-forward' : 'ios-arrow-back'}
						size={42}
					/>
				</TouchableOpacity>
				<ExitBar title={'Create New Notification'} hide={this.props.hide} />

				{/* Icon Selection */}
				<ScrollView
					keyboardShouldPersistTaps={'handled'}
					contentContainerStyle={{
						flexDirection: 'column',
						alignItems: 'center'
					}}
				>
					<Text style={styles.questionText}>
						{translate('Choose A Category')}
					</Text>
					<FlatList
						style={styles.list}
						data={Object.values(global.db.categories)
							.filter(icon => icon.key !== 'center')
							.sort((a, b) => a.order - b.order)}
						numColumns={4}
						scrollEnabled={false}
						renderItem={this._renderIcon}
					/>
					<View style={[SharedStyles.divider, { marginBottom: 20 }]} />

					{/* Location Selection */}
					<Text style={styles.questionText}>
						{translate('What Location Should We Notify You About?')}
					</Text>
					<TouchableOpacity
						style={styles.searchBar}
						activeOpacity={0.4}
						onPress={() => {
							this.setState({ searchModalVisible: true });
						}}
					>
						<FontAwesome name={'map-marker'} size={22} style={styles.pinIcon} />
						<Text>
							{this.state.newSubscription.formatted_address
								? this.state.newSubscription.formatted_address
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
					<View style={[SharedStyles.divider, { marginBottom: 20 }]} />

					{/* Distance Selection */}
					<Text style={styles.questionText}>
						{translate('Within What Distance Would You Like To Be Notified?')}
					</Text>
					<View style={styles.radiusContainer}>
						<Entypo name={'ruler'} size={35} style={styles.pinIcon} />
						<Picker
							style={{ width: '80%', alignSelf: 'center' }}
							selectedValue={this.state.newSubscription.radius}
							onValueChange={itemValue => this._setRadius(itemValue)}
							mode="dropdown"
						>
							{[2.5, 5, 7.5, 10, 15, 20, 25, 40, 50].map(distance =>
								<Picker.Item
									label={distance + ' km'}
									value={distance}
									key={distance}
								/>
							)}
						</Picker>
					</View>
				</ScrollView>

				{/* Submit Button */}
				<View style={SharedStyles.fixedBottomButton}>
					<TouchableOpacity style={styles.submit} onPress={this._submitPressed}>
						<Text style={styles.submitButtonText}>Finish</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white
	},
	list: {
		marginHorizontal: 10,
		marginBottom: 10
	},
	iconButton: {
		width: '23%',
		margin: '1%',
		height: 60,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-around',
		borderRadius: 10,
		padding: 10
	},
	iconText: {
		fontSize: 10,
		textAlign: 'center'
	},
	iconImage: {
		width: '60%',
		height: '100%',
		resizeMode: 'contain'
	},
	searchBar: {
		width: '80%',
		height: 40,
		alignSelf: 'center',
		backgroundColor: Colors.grey.light,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		marginBottom: 20
	},
	pinIcon: {
		marginHorizontal: 10
	},
	radiusContainer: {
		width: '90%',
		alignSelf: 'center',
		backgroundColor: Colors.grey.light,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		marginBottom: 20
	},
	questionText: {
		textAlign: 'center',
		marginTop: 10,
		marginBottom: 10,
		marginHorizontal: 15
	},
	submit: {
		backgroundColor: '#4565A9',
		height: 46,
		width: '85%',
		flexDirection: 'row',
		borderRadius: 10,
		justifyContent: 'space-around',
		alignItems: 'center',
		alignSelf: 'center'
	},
	submitButtonText: {
		color: 'white',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	}
});
