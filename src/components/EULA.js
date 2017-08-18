import {
	AsyncStorage,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import React from 'react';

import { translate } from '../utils/internationalization';
import Colors from '../styles/Colors';
import SharedStyles from '../styles/SharedStyles';
import eula from '../utils/eula.js';
import history from '../utils/history';

export default class EULA extends React.Component {
	constructor() {
		super();
		this.state = { reachedBottom: false };
	}

	_agree = async () => {
		console.log('Agreed to license');
		await AsyncStorage.setItem('eula', 'true');
		history.goBack();
	};

	// https://stackoverflow.com/questions/41056761/detect-scrollview-has-reached-the-end
	_isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
		const paddingToBottom = 20;
		return (
			layoutMeasurement.height + contentOffset.y >=
			contentSize.height - paddingToBottom
		);
	};

	render() {
		return (
			<View
				style={{
					flex: 1,
					paddingTop: 25
				}}
			>
				<Text
					style={{
						fontSize: 22,
						textAlign: 'center',
						borderBottomWidth: 1
					}}
				>
					{translate('END USER LICENSE AGREEMENT')}
				</Text>
				<ScrollView
					style={{ flex: 1, padding: 15 }}
					onScroll={({ nativeEvent }) => {
						if (this._isCloseToBottom(nativeEvent)) {
							this.setState({ reachedBottom: true });
						}
					}}
					scrollEventThrottle={400}
				>
					<Text>
						{eula}
					</Text>
				</ScrollView>

				{this.state.reachedBottom
					? <TouchableOpacity
							style={SharedStyles.finishButton}
							onPress={this._agree}
						>
							<Text style={{ color: Colors.white, fontSize: 30 }}>
								{translate('Agree')}
							</Text>
						</TouchableOpacity>
					: <View
							style={[
								SharedStyles.finishButton,
								{ backgroundColor: Colors.grey.medium }
							]}
						>
							<Text
								style={{ color: 'black', fontSize: 25, textAlign: 'center' }}
							>
								{translate('You must read to the bottom before you can agree')}
							</Text>
						</View>}
			</View>
		);
	}
}
