import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { WebBrowser } from 'expo';
import React, { Component } from 'react';
import getDirections from 'react-native-google-maps-directions';

import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';

import Colors from '../styles/Colors';
import SharedStyles from '../styles/SharedStyles';

export default class ViewCenter extends Component {
	constructor() {
		super();
	}

	render() {
		return (
			<View style={[SharedStyles.modalContent, styles.container]}>
				<TouchableOpacity
					onPress={() => {
						global.setCurrentModal(null);
					}}
					style={SharedStyles.exit}
				>
					<FontAwesome
						name={'close'}
						size={this.props.size ? this.props.size : 40}
					/>
				</TouchableOpacity>

				{/* Logo */}
				<Image
					style={styles.logo}
					source={{
						uri: this.props.center.image
					}}
				/>

				{/* Facebook */}
				<TouchableOpacity
					style={styles.dataRow}
					onPress={() => {
						if (this.props.center.facebookID) {
							WebBrowser.openBrowserAsync(
								'https://www.facebook.com/groups/' +
									this.props.center.facebookID
							);
						}
					}}
				>
					<FontAwesome
						style={styles.icon}
						name="facebook-square"
						size={40}
						color={'#3b5998'}
					/>
					<Text style={[styles.label, { textDecorationLine: 'underline' }]}>
						{this.props.center.title}
					</Text>
				</TouchableOpacity>

				{/* Phone number */}
				<View style={styles.dataRow}>
					<FontAwesome style={styles.icon} name="phone" size={40} />
					<Text style={styles.label}>
						{this.props.center.phone}
					</Text>
				</View>

				{/* Hours */}
				{this.props.center.hours
					? <View style={styles.dataRow}>
							<Ionicons
								style={styles.icon}
								name="ios-information-circle-outline"
								size={40}
							/>
							<View style={{ flex: 1 }}>
								{[
									'Monday',
									'Tuesday',
									'Wednesday',
									'Thursday',
									'Friday',
									'Saturday',
									'Sunday'
								].map(day =>
									<Text key={day} style={{ backgroundColor: 'transparent' }}>
										{translate(day)}: {this.props.center.hours[day]}
									</Text>
								)}
							</View>
						</View>
					: null}

				<View style={styles.buttonContainer}>
					{/* Directions button */}
					<TouchableOpacity
						style={styles.button}
						onPress={getDirections.bind(this, {
							destination: this.props.center
						})}
					>
						<Text style={{ textAlign: 'center' }}>
							{translate('Get Directions')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		justifyContent: 'space-around',
		padding: 10,
		backgroundColor: 'white',
		alignItems: 'center'
	},
	logo: {
		width: 200,
		height: 160,
		resizeMode: 'contain'
	},
	dataRow: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		width: '80%',
		alignItems: 'center'
	},
	icon: {
		marginRight: 30
	},
	label: {
		width: '70%'
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		width: '85%',
		alignItems: 'center',
		paddingTop: 10,
		borderTopWidth: 1,
		borderColor: Colors.grey.medium
	},
	button: {
		backgroundColor: Colors.grey.medium,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: Colors.grey.dark,
		paddingVertical: 8,
		paddingHorizontal: 8,
		width: 125,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center'
	}
});
