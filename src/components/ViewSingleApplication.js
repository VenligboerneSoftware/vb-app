import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';

import { deleteApplication } from '../utils/ApplicationManager';
import { translate } from '../utils/internationalization';
import ApplicationStatus from './ApplicationStatus';
import Colors from '../styles/Colors';
import ExitBar from './ExitBar';
import FacebookContactButton from './FacebookContactButton.js';
import MapWithCircle from './MapWithCircle';
import SharedStyles from '../styles/SharedStyles';
import Time from './Time';
import TitleAndIcon from './TitleAndIcon.js';

export default class ViewSingleApplication extends React.Component {
	constructor(props) {
		super(props);
	}

	removeListing = () => {
		deleteApplication(this.props.app);
		this.props.hide();
	};

	_deleteApp = () => {
		console.log('Attempting to delete item');
		Alert.alert(
			translate('Are you sure you want to remove this reply?'),
			translate('This cannot be undone'),
			[
				{ text: translate('No') },
				{ text: translate('Yes'), onPress: this.removeListing }
			],
			{ cancelable: false }
		);
	};

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: 'white' }}>
				<ExitBar hide={this.props.hide} />
				<ScrollView keyboardShouldPersistTaps={'handled'}>
					<View style={styles.container}>
						<TitleAndIcon post={this.props.app.postData} />

						<ApplicationStatus status={this.props.app.status} modal={true} />

						<View style={SharedStyles.divider} />

						<Text style={styles.description}>
							{translate('Event Description') + ':'}{' '}
							{this.props.app.postData.description}
						</Text>

						<View style={SharedStyles.divider} />

						<Text style={SharedStyles.message}>
							{translate('Your Reply') + ':'} {this.props.app.message}
						</Text>
						<View style={SharedStyles.divider} />
						<Time dates={this.props.app.postData.dates} />
						<View style={SharedStyles.divider} />
						<MapWithCircle
							style={{ flex: 1 }}
							latitude={this.props.app.postData.latitude}
							longitude={this.props.app.postData.longitude}
						/>

						<TouchableOpacity
							style={styles.deleteButton}
							onPress={() => {
								this._deleteApp();
							}}
						>
							<FontAwesome name={'trash-o'} size={40} />
							<Text style={styles.deleteText}>
								{translate('Delete Reply')}
							</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>

				{/* Bottom bar that appears if application has been
					accepted to the event by owner */}
				{this.props.app.status === 'Accepted'
					? <FacebookContactButton
							owner={this.props.app.owner}
							description={'Contact Event Owner'}
						/>
					: null}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'space-around',
		backgroundColor: 'white',
		alignItems: 'center'
	},

	description: {
		textAlign: 'center', //Change to right for arabic/farsi
		color: 'black',
		margin: 15,
		marginLeft: 20,
		marginRight: 20,
		fontSize: 15
	},
	deleteButton: {
		backgroundColor: Colors.grey.light,
		width: 250,
		paddingVertical: 5,
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 15
	},
	deleteText: {
		marginTop: 5,
		alignSelf: 'center',
		marginBottom: 10,
		fontSize: 18
	}
});
