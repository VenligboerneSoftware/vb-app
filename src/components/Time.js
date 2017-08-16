// Displays the time prop or a default message if time
// is not specified

import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import React, { Component } from 'react';

import { translate } from '../utils/internationalization';

export default class Time extends Component {
	render() {
		return (
			<View style={styles.time}>
				<FontAwesome name={'calendar'} size={35} style={{ marginRight: 10 }} />
				<Text style={{ marginLeft: 10 }}>
					{this.props.datetime
						? new Date(this.props.datetime).toLocaleDateString()
						: translate('Date Not Specified')}
				</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	time: {
		flexDirection: 'row',
		justifyContent: 'center',
		padding: 15,
		alignItems: 'center'
	}
});
