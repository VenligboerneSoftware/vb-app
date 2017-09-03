// Displays the time prop or a default message if time
// is not specified

import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import React, { Component } from 'react';

import Colors from '../styles/Colors';

export default class ExitBar extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<View style={styles.topBar}>
				{this.props.title ? (
					<Text style={styles.title}>{this.props.title}</Text>
				) : null}
				<TouchableOpacity
					onPress={() => {
						this.props.exit ? this.props.exit() : null;
						!this.props.disableExit ? global.setCurrentModal(null) : null;
					}}
					style={styles.exit}
				>
					<FontAwesome
						name={'close'}
						size={this.props.size ? this.props.size : 40}
					/>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	exit: {
		position: 'absolute',
		top: 5,
		right: 10,
		zIndex: 10
	},
	topBar: {
		borderColor: Colors.grey.medium,
		borderBottomWidth: 1,
		height: 50,
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'center'
	},
	title: {
		textAlign: 'center',
		alignSelf: 'center',
		fontSize: 18,
		fontWeight: '600'
	}
});
