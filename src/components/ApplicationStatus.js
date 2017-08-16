import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { translate } from '../utils/internationalization';

export default class ApplicationStatus extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<View
				style={this.props.modal ? styles.statusModal : styles.statusRegular}
			>
				{global.language === 'Arabic' || global.language === 'Farsi'
					? <View style={{ flexDirection: 'row' }}>
							<Text
								style={{
									color: {
										Applied: 'orange',
										Accepted: 'green',
										Rejected: 'red'
									}[this.props.status]
								}}
							>
								{' ' + translate(this.props.status)}
							</Text>
							<Text>
								{translate('Status') + ':'}
							</Text>
						</View>
					: <View style={{ flexDirection: 'row' }}>
							<Text>
								{translate('Status') + ':'}
							</Text>
							<Text
								style={{
									color: {
										Applied: 'orange',
										Accepted: 'green',
										Rejected: 'red'
									}[this.props.status]
								}}
							>
								{' ' + translate(this.props.status)}
							</Text>
						</View>}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	statusModal: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'center',
		marginBottom: 7
	},
	statusRegular: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		marginTop: 7
	}
});
