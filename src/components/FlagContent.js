import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';

import { FontAwesome } from '@expo/vector-icons';

import { translate } from '../utils/internationalization';
import Colors from '../styles/Colors.js';
import SharedStyles from '../styles/SharedStyles';

export default class FlagContent extends React.Component {
	constructor(props) {
		super(props);
	}

	_flagPost = () => {
		Alert.alert(
			translate('Are you sure you want to report this content?'),
			translate('It will be reviewed by moderators'),
			[{ text: translate('No') }, { text: translate('Yes') }],
			{ cancelable: false }
		);
	};

	render() {
		return (
			<View>
				<TouchableOpacity style={styles.flag} onPress={this._flagPost}>
					<FontAwesome
						name={'exclamation-circle'}
						size={35}
						style={{ backgroundColor: 'transparent', marginLeft: 10 }}
					/>
					<Text style={{ alignSelf: 'center', margin: 10 }}>
						{translate('Flag as inappropriate')}
					</Text>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	flag: {
		alignSelf: 'center',
		backgroundColor: Colors.grey.light,
		justifyContent: 'center',
		flexDirection: 'row',
		marginBottom: 10,
		borderRadius: 10
	}
});
