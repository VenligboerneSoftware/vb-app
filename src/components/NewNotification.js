import React from 'react';
import {
	StyleSheet,
	FlatList,
	Text,
	View,
	TouchableOpacity,
	Image,
	Alert,
	Picker,
	I18nManager
} from 'react-native';
import ExitBar from './ExitBar';
import Colors from '../styles/Colors';
import * as firebase from 'firebase';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';
import Modal from './Modal.js';
import SearchLocation from './SearchLocation.js';

import { FontAwesome, Entypo, Ionicons } from '@expo/vector-icons';

export default class NewNotification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newSubscription: {
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
							icon: item.key
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
			translate('Ready?'),
			translate('Category') +
				': ' +
				translate(global.db.categories[this.state.newSubscription.icon].title) +
				'\n' +
				translate('Location') +
				': ' +
				this.state.newSubscription.formatted_address +
				'\n' +
				translate('Distance') +
				': ' +
				this.state.newSubscription.radius +
				' km',
			[
				{
					text: translate('No'),
					style: 'cancel'
				},
				{
					text: translate('Yes'),
					onPress: () => {
						firebase
							.database()
							.ref('subscriptions')
							.child(firebase.auth().currentUser.uid)
							.push(this.state.newSubscription);
						this._backToManageNotifications();
					}
				}
			]
		);
	};

	_backToManageNotifications = () => {
		global.setCurrentModal('/ManageNotifications');
	};

	render() {
		return (
			<View style={[SharedStyles.modalContent, styles.container]}>
				<TouchableOpacity
					onPress={this._backToManageNotifications}
					style={SharedStyles.back}
				>
					<Ionicons
						name={I18nManager.isRTL ? 'ios-arrow-forward' : 'ios-arrow-back'}
						size={42}
					/>
				</TouchableOpacity>
				<ExitBar title={'Create New Notification'} />

				{/* Icon Selection */}
				<View style={[styles.section, { flex: 4 }]}>
					<Text style={styles.questionText}>
						{translate('Choose a Category')}
					</Text>
					<FlatList
						data={Object.values(global.db.categories)
							.filter(icon => icon.key !== 'center')
							.sort((a, b) => a.order - b.order)}
						numColumns={4}
						scrollEnabled={true}
						renderItem={this._renderIcon}
					/>
				</View>
				<View style={SharedStyles.divider} />

				{/* Location Selection */}
				<View style={[styles.section, { flex: 2 }]}>
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
						<Text style={styles.questionText}>
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
				</View>
				<View style={SharedStyles.divider} />

				{/* Distance Selection */}
				<View style={[styles.section, { flex: 3 }]}>
					<Text style={styles.questionText}>
						{translate('Within What Distance Would You Like To Be Notified?')}
					</Text>
					<View style={styles.radiusContainer}>
						<Entypo name={'ruler'} size={35} style={styles.pinIcon} />
						<Picker
							style={{ width: '75%', alignSelf: 'center' }}
							selectedValue={this.state.newSubscription.radius}
							onValueChange={itemValue => this._setRadius(itemValue)}
							mode="dropdown"
							itemStyle={{ height: 80, fontSize: 14 }}
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
				</View>

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
		backgroundColor: Colors.white
	},
	section: {
		marginTop: 5,
		marginBottom: 5,
		marginHorizontal: 5,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-around'
	},
	iconButton: {
		width: '24%',
		margin: '0.5%',
		height: 60,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-around',
		borderRadius: 10,
		paddingHorizontal: 5,
		paddingBottom: 5,
		paddingTop: 1
	},
	iconText: {
		fontSize: 10,
		textAlign: 'center'
	},
	iconImage: {
		width: '60%',
		height: '80%',
		resizeMode: 'contain'
	},
	searchBar: {
		width: '90%',
		height: 40,
		alignSelf: 'center',
		backgroundColor: Colors.grey.light,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10
	},
	pinIcon: {
		marginHorizontal: 10
	},
	radiusContainer: {
		width: '90%',
		backgroundColor: Colors.grey.light,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10
	},
	questionText: {
		textAlign: 'center',
		fontSize: 13,
		backgroundColor: 'transparent',
		width: '80%'
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
