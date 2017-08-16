import { Image, StyleSheet, View } from 'react-native';
import React from 'react';

export default class FacebookProfileIcon extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View>
				<Image
					source={{
						uri: this.props.photoURL
					}}
					style={this.props.button ? styles.buttonPic : styles.ownerPic}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	ownerPic: {
		width: 50,
		height: 50,
		borderRadius: 25
	},
	buttonPic: {
		width: 40,
		height: 40,
		borderRadius: 20
	}
});

FacebookProfileIcon.defaultProps = { button: true };
