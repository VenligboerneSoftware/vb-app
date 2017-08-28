import {
	Alert,
	I18nManager,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import React from 'react';

import { Ionicons } from '@expo/vector-icons';

import { translate, translateFreeform } from '../utils/internationalization';
import ApplicationStatus from './ApplicationStatus.js';
import Colors from '../styles/Colors';
import ExitBar from './ExitBar';
import FacebookContactButton from './FacebookContactButton.js';
import FlagContent from './FlagContent';
import MapWithCircle from './MapWithCircle';
import SharedStyles from '../styles/SharedStyles';
import Time from './Time';
import TitleAndIcon from './TitleAndIcon.js';

export default class OwnerViewApplicant extends React.Component {
	acceptApplicant = () => {
		//TODO: translate
		Alert.alert(
			'Are you sure you want to accept?',
			'This person will be able to view your Facebook Profile',
			[
				{ text: translate('No') },
				{
					text: translate('Yes'),
					onPress: () => {
						this.props.appStatusChange(this.props.application, 'Accepted');
					}
				}
			],
			{ cancelable: false }
		);
	};

	rejectApplicant = () => {
		//TODO: translate
		Alert.alert(
			'Are you sure you want to reject?',
			'This person will not be able to contact you',
			[
				{ text: translate('No') },
				{
					text: translate('Yes'),
					onPress: () => {
						this.props.appStatusChange(this.props.application, 'Rejected');
					}
				}
			],
			{ cancelable: false }
		);
	};

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: 'white' }}>
				<TouchableOpacity onPress={this.props.back} style={SharedStyles.back}>
					<Ionicons
						name={I18nManager.isRTL ? 'ios-arrow-forward' : 'ios-arrow-back'}
						size={42}
					/>
				</TouchableOpacity>

				<ExitBar hide={this.props.hide} />

				<ScrollView keyboardShouldPersistTaps={'handled'}>
					<View style={styles.container}>
						<TitleAndIcon post={this.props.post} />
						<ApplicationStatus
							status={this.props.application.status}
							modal={true}
						/>

						<View style={SharedStyles.divider} />

						<Text style={styles.name}>
							{translate('Name') + ': '}
							{this.props.application.applicantInfo.displayName}
						</Text>

						<View style={SharedStyles.divider} />

						<Text style={SharedStyles.message}>
							{translate('Response') + ': '}
							{translateFreeform(this.props.application.message)}
						</Text>

						<View style={SharedStyles.divider} />

						{this.props.application.status === 'Waiting For Response'
							? <View style={styles.acceptRejectContainer}>
									<TouchableOpacity
										style={styles.acceptRejectButton}
										onPress={() => {
											this.acceptApplicant();
										}}
									>
										<Text style={styles.acceptText}>
											{translate('Accept')}
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.acceptRejectButton}
										onPress={() => {
											this.rejectApplicant();
										}}
									>
										<Text style={styles.rejectText}>
											{translate('Reject')}
										</Text>
									</TouchableOpacity>
								</View>
							: null}

						<Time dates={this.props.post.dates} />
						<View style={SharedStyles.divider} />
						<MapWithCircle
							style={{ flex: 1 }}
							latitude={this.props.post.latitude}
							longitude={this.props.post.longitude}
						/>
						<FlagContent
							applicationID={this.props.application.key}
							flaggedUser={this.props.application.applicant}
						/>
					</View>
				</ScrollView>
				<FacebookContactButton
					owner={this.props.application.applicantInfo}
					description={'Contact Responder'}
				/>
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
	name: {
		color: 'black',
		textAlign: 'center',
		fontSize: 18,
		marginTop: 10,
		marginBottom: 10
	},
	acceptRejectContainer: {
		flexDirection: 'row',
		width: '80%',
		justifyContent: 'space-around',
		paddingTop: 10,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderColor: Colors.grey.medium
	},
	acceptRejectButton: {
		backgroundColor: '#EBEDEC',
		height: 60,
		width: '30%',
		flex: 1,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#D9D9D9',
		justifyContent: 'center',
		marginRight: 5,
		marginLeft: 5
	},
	acceptText: {
		color: 'green',
		fontWeight: '600',
		marginTop: 5,
		alignSelf: 'center',
		marginBottom: 10,
		fontSize: 18
	},
	rejectText: {
		color: 'red',
		fontWeight: '600',
		marginTop: 5,
		alignSelf: 'center',
		marginBottom: 10,
		fontSize: 18
	}
});
