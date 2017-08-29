// Displays the time prop or a default message if time
// is not specified

import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import React, { Component } from 'react';

import { translate } from '../utils/internationalization';
import { sortedDatesString } from '../utils/dates';

export default class Time extends Component {
	render() {
		return (
			<View style={styles.time}>
				<FontAwesome
					name={'calendar'}
					size={35}
					style={{
						marginRight: 10,
						marginLeft: 10,
						justifyContent: 'center'
					}}
				/>
				<Text style={{ textAlign: 'center' }}>
					{this.props.dates
						? sortedDatesString(this.props.dates)
						: translate('Date Not Specified')}
				</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	time: {
		width: '90%',
		flexDirection: 'row',
		justifyContent: 'center',
		padding: 12,
		alignItems: 'center'
	}
});
