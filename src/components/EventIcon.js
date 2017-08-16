import { StyleSheet, View, Text, Image } from 'react-native';
import React from 'react';
import { translate } from '../utils/internationalization';
import Colors from '../styles/Colors.js';

export default class EventIcon extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={styles.container}>
				<View
					style={[
						{
							backgroundColor:
								this.props.item.icon === 'center' ? 'red' : Colors.blue.dark
						},
						styles.icon
					]}
				>
					<Image
						style={{ width: 32, height: 32, tintColor: 'white' }}
						source={{ uri: global.db.categories[this.props.item.icon].iconURL }}
					/>
				</View>
				<Text style={styles.iconText}>
					{translate(global.db.categories[this.props.item.icon].title)}
				</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		alignItems: 'center'
	},
	icon: {
		borderRadius: 50,
		padding: 8,
		height: 48,
		width: 48,
		alignItems: 'center',
		alignSelf: 'center'
	},
	iconText: {
		fontSize: 10,
		textAlign: 'center',
		backgroundColor: 'transparent',
		color: Colors.blue.dark,
		width: 70
	}
});
