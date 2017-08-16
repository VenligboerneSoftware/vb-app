import React from 'react';
import { StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';

export default class FilterListItem extends React.PureComponent {
	render() {
		return (
			<TouchableOpacity onPress={this.props.onPress} style={styles.iconButton}>
				<Image
					style={[{ tintColor: this.props.color }, styles.iconImage]}
					source={{ uri: this.props.item.iconURL }}
				/>

				<Text style={[{ color: this.props.color }, styles.iconText]}>
					{translate(this.props.item.title)}
				</Text>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	iconButton: {
		flexDirection: 'column',
		alignItems: 'center',
		width: 50,
		margin: 3
	},
	iconText: {
		fontSize: 10,
		textAlign: 'center'
	},
	iconImage: {
		width: 30,
		height: 30,
		resizeMode: 'contain'
	}
});
