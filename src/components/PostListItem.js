import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import firebase from 'firebase';

import { formatDate, getNextDate } from '../utils/dates';
import { translate, translateFreeform } from '../utils/internationalization';
import EventIcon from './EventIcon';
import getDistance from '../utils/getDistance';

export default class PostListItem extends React.PureComponent {
	render() {
		return (
			<TouchableOpacity
				onPress={this.props.showModal.bind(this, this.props.item)}
				style={styles.rowStyles}
			>
				<EventIcon item={this.props.item} />

				<Text style={styles.rowText}>
					{translateFreeform(this.props.item.title)}
				</Text>

				{this.props.item.owner === firebase.auth().currentUser.uid
					? <TouchableOpacity
							style={styles.applicationCounter}
							onPress={this.props.showApplications.bind(this, this.props.item)}
						>
							<ApplicationCount applications={this.props.item.applications} />
						</TouchableOpacity>
					: null}
				{this.props.item.dates
					? // display date of event
						<Text style={styles.dateText}>
							{formatDate(getNextDate(this.props.item.dates)) +
								(this.props.item.dates.length > 1 ? '...' : '')}
						</Text>
					: null}

				{this.props.distanceCenter
					? // display how far away the event is
						<Text style={styles.distanceText}>
							{Math.round(
								getDistance(this.props.distanceCenter, this.props.item) / 1000
							) + ' km'}
						</Text>
					: null}
			</TouchableOpacity>
		);
	}
}

// Stateless component! Read more about them at
// https://medium.com/front-end-hacking/stateless-components-in-react-native-e9034f2e3701
const ApplicationCount = ({ applications }) => {
	const numApplications = Object.keys(applications).length;
	return (
		<Text style={styles.numAppText}>
			{numApplications}{' '}
			{translate(numApplications === 1 ? 'Response' : 'Responses')}
		</Text>
	);
};

const styles = StyleSheet.create({
	rowStyles: {
		flexDirection: 'row',
		padding: 10
	},
	rowText: {
		flex: 1,
		fontSize: 19,
		marginLeft: 10,
		marginRight: 10,
		color: 'black',
		textAlign: 'left'
	},
	applicationCounter: {
		justifyContent: 'center',
		backgroundColor: '#658bcd',
		borderRadius: 12,
		height: 24,
		alignItems: 'center',
		width: 120
	},
	dateText: {
		position: 'absolute',
		right: 15,
		bottom: 22
	},
	distanceText: {
		position: 'absolute',
		right: 15,
		bottom: 3
	},
	numAppText: {
		color: 'white',
		backgroundColor: 'transparent'
	}
});
