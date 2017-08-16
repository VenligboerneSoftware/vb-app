import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebBrowser } from 'expo';
import React, { Component } from 'react';

import { FontAwesome } from '@expo/vector-icons';

import { translate } from '../utils/internationalization';
import FacebookProfileIcon from './FacebookProfileIcon';
import SharedStyles from '../styles/SharedStyles';

export default class FacebookContactButton extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={SharedStyles.fixedBottomButton}>
				<TouchableOpacity
					style={styles.contact}
					onPress={() => {
						WebBrowser.openBrowserAsync(
							'https://www.facebook.com/' + this.props.owner.facebookUID
						);
					}}
				>
					<FontAwesome
						name={'facebook'}
						size={20}
						style={styles.facebookIcon}
					/>
					<View style={styles.fbDivider} />
					<Text style={styles.facebookButtonText}>
						{translate(this.props.description)}
					</Text>
					<View style={styles.fbDivider} />
					<FacebookProfileIcon {...this.props.owner} />
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	facebookButtonText: {
		color: 'white',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	facebookIcon: {
		color: 'white'
	},
	fbDivider: {
		width: 2,
		height: 20,
		backgroundColor: 'white',
		alignItems: 'center'
	},
	contact: {
		backgroundColor: '#4565A9',
		height: 46,
		width: '85%',
		flexDirection: 'row',
		borderRadius: 10,
		justifyContent: 'space-around',
		alignItems: 'center',
		alignSelf: 'center'
	}
});
