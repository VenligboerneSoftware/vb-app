import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';

import { translate } from '../utils/internationalization';
import SharedStyles from '../styles/SharedStyles';

export default class ClearFilter extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return this.props.filterApplied
			? <View style={{ alignItems: 'center', width: '100%', marginBottom: 10 }}>
					<Text style={{ textAlign: 'center', margin: 10 }}>
						{translate(
							'Clear your filters or search another location to see more posts.'
						)}
					</Text>
					<TouchableOpacity
						style={SharedStyles.button}
						onPress={this.props.onPress}
					>
						<Text>
							{translate('Clear filters')}
						</Text>
					</TouchableOpacity>
				</View>
			: null;
	}
}
