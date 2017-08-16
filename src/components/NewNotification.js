import React from 'react';
import {
	StyleSheet,
	FlatList,
	Text,
	View,
	TouchableOpacity,
	Image,
	ScrollView,
	Slider
} from 'react-native';
import ExitBar from './ExitBar';
import Colors from '../styles/Colors';
import * as firebase from 'firebase';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';
import Modal from 'react-native-modal';
import SearchLocation from './SearchLocation.js';

import { FontAwesome, Entypo } from '@expo/vector-icons';

export default class NewNotification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newSubscription: {
				owner: firebase.auth().currentUser.uid,
				radius: 1.0
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
						newSubscription: { ...this.state.newSubscription, icon: item.key }
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
				radius: parseFloat(num.toFixed(1))
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
		// TODO: Add to firebase and translate text once we decide wording is right

		firebase.database().ref('subscriptions').push(this.state.newSubscription);
		this.props.hide();
	};

	render() {
		return (
			<View style={styles.container}>
				<ExitBar title={'Create New Notification'} hide={this.props.hide} />

				{/* Icon Selection */}
				<ScrollView
					contentContainerStyle={{
						flexDirection: 'column',
						alignItems: 'center'
					}}
				>
					<Text style={styles.questionText}>Choose A Category</Text>
					<FlatList
						style={styles.list}
						data={Object.values(global.db.categories).filter(
							icon => icon.key !== 'center'
						)}
						numColumns={4}
						scrollEnabled={false}
						renderItem={this._renderIcon}
					/>
					<View style={[SharedStyles.divider, { marginBottom: 30 }]} />

					{/* Location Selection */}
					<Text style={styles.questionText}>
						What Location Should We Notify You About?
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
						Within What Distance Would You Like To Be Notified?
					</Text>
					<View style={styles.radiusContainer} onPress={this._distancePicker}>
						<Entypo name={'ruler'} size={22} style={styles.pinIcon} />
						<Slider
							maximumValue={100}
							minimumValue={1}
							step={0.5}
							onSlidingComplete={num => this._setRadius(num)}
							value={1.0}
							style={{ width: '55%' }}
						/>
						<View style={{ width: '20%', marginRight: 10 }}>
							<Text style={{ fontSize: 16 }}>
								{this.state.newSubscription.radius} km
							</Text>
						</View>
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
		marginBottom: 30
	},
	pinIcon: {
		marginHorizontal: 10
	},
	radiusContainer: {
		width: '90%',
		height: 50,
		alignSelf: 'center',
		backgroundColor: Colors.grey.light,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderRadius: 10,
		marginBottom: 30
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
