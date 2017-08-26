import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { translateFreeform } from '../utils/internationalization';
import EventIcon from './EventIcon';

export default class TitleAndIcon extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={{ margin: 10 }}>
				{/* Title */}
				<Text style={styles.title}>
					{translateFreeform(this.props.post.title)}
				</Text>
				<EventIcon item={this.props.post} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	title: {
		fontSize: 22,
		fontWeight: '600',
		alignItems: 'center',
		textAlign: 'center',
		marginTop: 10,
		margin: 5,
		color: 'black'
	}
});
