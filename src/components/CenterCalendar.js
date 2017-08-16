import { Agenda, LocaleConfig } from 'react-native-calendars';
import {
	Alert,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import { WebBrowser } from 'expo';
import React from 'react';
import firebase from 'firebase';

import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

import { translate } from '../utils/internationalization';
import Colors from '../styles/Colors.js';
import SharedStyles from '../styles/SharedStyles';

export default class CenterCalendar extends React.Component {
	constructor() {
		super();
		this.state = {
			items: {}
		};
		LocaleConfig.locales.en = {
			monthNames: [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			].map(translate),
			monthNamesShort: [
				'Jan',
				'Feb',
				'Mar',
				'Apr',
				'May',
				'June',
				'July',
				'Aug',
				'Sept',
				'Oct',
				'Nov',
				'Dec'
			].map(translate),
			dayNames: [
				'Sunday',
				'Monday',
				'Tuesday',
				'Wednesday',
				'Thursday',
				'Friday',
				'Saturday'
			].map(translate),
			dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
				translate
			)
		};
		LocaleConfig.defaultLocale = 'en';
	}

	// Pull events from Facebook for display on the calendar
	async componentDidMount() {
		this.subscriptionRef = firebase
			.database()
			.ref('centers')
			.child(this.props.center.key)
			.child('subscrubs')
			.child(firebase.auth().currentUser.uid);
		this.subscriptionRef.on('value', subscrubs => {
			this.setState({ isSubscribed: subscrubs.exists() });
		});

		let dailyEvents = {};
		for (let i = -7; i <= 60; i++) {
			const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
			dailyEvents[date.toISOString().split('T')[0]] = [];
		}

		const groupID = this.props.center.facebookID;
		if (groupID) {
			const url = `https://graph.facebook.com/v2.10/${groupID}/events?access_token=${global.token}`;

			const response = await (await fetch(url)).json();
			if (response.data.length === 0) {
				Alert.alert(
					translate('No Events'),
					translate(
						"Are you sure you are a member of this group? You don't have access to any of its Facebook events. It may just not have any. Would you like to try to join this group?"
					),
					[
						{
							text: translate('Yes'),
							onPress: () => {
								WebBrowser.openBrowserAsync(
									`https://www.facebook.com/groups/${groupID}`
								);
							}
						},
						{
							text: translate('No'),
							onPress: () => {}
						}
					]
				);
			}

			response.data.forEach(event => {
				const date = event.start_time.split('T')[0];
				if (!dailyEvents[date]) {
					dailyEvents[date] = [];
				}
				dailyEvents[date].push(event);
			});
		}

		this.setState({ items: dailyEvents });
	}

	// Clear the listener so it doesn't try to update the component after it unmounts
	componentWillUnmount() {
		this.subscriptionRef.off();
	}

	render() {
		return (
			<View style={styles.container}>
				{/* Close icon */}
				<TouchableOpacity onPress={this.props.hide} style={SharedStyles.back}>
					<Ionicons name={'ios-arrow-back'} size={50} />
				</TouchableOpacity>

				<Agenda
					style={{ marginTop: 60 }}
					items={this.state.items}
					renderItem={item =>
						<TouchableOpacity
							style={styles.item}
							onPress={() => {
								WebBrowser.openBrowserAsync(
									`https://www.facebook.com/events/${item.id}`
								);
							}}
						>
							<Text style={{ fontSize: 16, marginBottom: 5 }}>
								{moment(item.start_time).toDate().toLocaleString()}
							</Text>
							<Text style={{ fontSize: 20, marginBottom: 5 }}>
								{item.name}
							</Text>
							<Text style={{ color: 'gray' }}>
								{item.description}
							</Text>
						</TouchableOpacity>}
					renderEmptyDate={() => <View style={styles.emptyDate} />}
					rowHasChanged={(r1, r2) => r1.name !== r2.name}
				/>
				<View style={styles.bottomBar}>
					<Text style={{ width: '70%', textAlign: 'center' }}>
						{translate('Notify me about events at this center')}
					</Text>
					<Switch
						onValueChange={value => {
							this.subscriptionRef.set(value ? true : null);
						}}
						value={this.state.isSubscribed}
					/>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		padding: 0,
		backgroundColor: 'white'
	},
	item: {
		backgroundColor: 'white',
		flex: 1,
		borderRadius: 5,
		padding: 10,
		marginRight: 10,
		marginTop: 17
	},
	emptyDate: {
		height: 15,
		flex: 1,
		paddingTop: 30
	},
	bottomBar: {
		backgroundColor: Colors.blue.medium,
		height: 60,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	}
});
