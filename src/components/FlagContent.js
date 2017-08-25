import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import Modal from './Modal.js';
import React from 'react';
import firebase from 'firebase';

import { FontAwesome } from '@expo/vector-icons';

import { translate } from '../utils/internationalization';
import Colors from '../styles/Colors.js';
import ExitBar from './ExitBar';
import SharedStyles from '../styles/SharedStyles';

export default class FlagContent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isModalVisible: false
		};
	}

	_submitReport = () => {
		const report = {
			flaggingUser: firebase.auth().currentUser.uid,
			reason: this.state.reason || null,
			postID: this.props.postID || null,
			applicationID: this.props.applicationID || null
		};
		console.log(
			'Submitting report of inappropriate content',
			this.props.flaggedUser,
			report
		);
		firebase.database().ref('flags').child(this.props.flaggedUser).push(report);
		this.setState({ isModalVisible: false });
	};

	render() {
		return (
			<View>
				<Modal isVisible={this.state.isModalVisible} name={'FlagContent'}>
					<View style={styles.container}>
						<ExitBar
							title={translate('Report As Inappropriate')}
							hide={() => this.setState({ isModalVisible: false })}
						/>
						<View style={{ flexDirection: 'row', width: '100%' }}>
							<FontAwesome
								name={'exclamation-circle'}
								size={50}
								style={{ marginRight: 10, alignSelf: 'center' }}
							/>
							<Text style={{ fontSize: 20, flex: 1 }}>
								{translate(
									'Why is this content inappropriate? Moderators will review this post based on your response.'
								)}
							</Text>
						</View>
						<TextInput
							onChangeText={text => this.setState({ reason: text })}
							style={styles.textInput}
							underlineColorAndroid={'white'}
							blurOnSubmit={true}
							returnKeyType="done"
							multiline={true}
						/>
						<Text
							style={[SharedStyles.button, { textAlign: 'center' }]}
							onPress={this._submitReport}
						>
							{translate('Submit Report')}
						</Text>
					</View>
				</Modal>
				<TouchableOpacity
					style={styles.flag}
					onPress={() => this.setState({ isModalVisible: true })}
				>
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
	container: {
		flex: 1,
		justifyContent: 'space-around',
		padding: 10,
		backgroundColor: 'white',
		alignItems: 'center'
	},
	textInput: {
		flex: 1,
		width: '90%',
		backgroundColor: Colors.white,
		fontSize: 18,
		margin: 20,
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.grey.dark,
		borderRadius: 10,
		textAlignVertical: 'top'
	},
	flag: {
		alignSelf: 'center',
		backgroundColor: Colors.grey.light,
		justifyContent: 'center',
		flexDirection: 'row',
		marginBottom: 10,
		borderRadius: 10
	}
});
