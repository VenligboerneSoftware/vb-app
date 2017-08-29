import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';
import Colors from 'venligboerneapp/src/styles/Colors.js';

export default class FlagButton extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<TouchableOpacity
				style={styles.flag}
				onPress={() =>
					global.setCurrentModal('/FlagContent', {
						flaggedUser: this.props.flaggedUser,
						postID: this.props.postID,
						applicationID: this.props.applicationID,
						exit: this.props.exit
					})}
			>
				<FontAwesome
					name={'exclamation-circle'}
					size={35}
					style={{
						backgroundColor: 'transparent',
						marginLeft: 10
					}}
				/>
				<Text style={{ alignSelf: 'center', margin: 10 }}>
					{translate('Flag as inappropriate')}
				</Text>
			</TouchableOpacity>
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
