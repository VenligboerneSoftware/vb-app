import {
	Dimensions,
	FlatList,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import React from 'react';
import firebase from 'firebase';

import { formatDate, getNextDate } from '../utils/dates';
import { translate } from '../utils/internationalization';
import EventIcon from './EventIcon.js';
import SharedStyles from '../styles/SharedStyles';

export default class BarePostList extends React.PureComponent {
	// Rather inaccurate, but very fast, geodistance function
	getDistance = (a, b) => {
		const deltaLatitude = a.latitude - b.latitude;
		const deltaLongitude =
			(a.longitude - b.longitude) * Math.cos(a.latitude / 180.0 * Math.PI);
		const totalDegrees = Math.sqrt(
			deltaLatitude * deltaLatitude + deltaLongitude * deltaLongitude
		);
		// 111319 is the width of one degree latitude in meters
		return totalDegrees * 111319;
	};

	// Sort the posts by increasing distance from the mapRegion center, if specified.
	// Use the users current location to label distance, but fall back on the
	// map region center.
	_sort = posts => {
		console.log('Sorting start ', Date.now());
		posts = posts
			// Calculate distances
			.map(post => ({
				distance: this.getDistance(this.props.sortCenter, post),
				post: post
			}))
			// Sort by distance
			.sort((a, b) => a.distance - b.distance)
			.map(obj => obj.post);
		console.log('Sort complete ', Date.now());
		return posts;
	};

	render() {
		console.log('Rendering a BarePostList', this.props.listData.length);
		// TODO use the FlatList instead. FlatLists can scroll
		// TODO don't use that hacky Dimensions.get thing
		return (
			<ScrollView
				keyboardShouldPersistTaps={'handled'}
				style={{ flex: 1, width: Dimensions.get('window').width }}
			>
				<FlatList
					data={
						this.props.sortCenter
							? this._sort(this.props.listData)
							: this.props.listData
					}
					scrollEnabled={false}
					initialNumToRender={10}
					ItemSeparatorComponent={() => <View style={SharedStyles.divider} />}
					renderItem={({ item }) =>
						<TouchableOpacity
							onPress={this.props.showModal.bind(this, item)}
							style={styles.rowStyles}
						>
							<EventIcon item={item} />

							<Text style={styles.rowText}>
								{item.title}
							</Text>

							{item.owner === firebase.auth().currentUser.uid
								? <TouchableOpacity
										style={styles.applicationCounter}
										onPress={this.props.showApplications.bind(this, item)}
									>
										<ApplicationCount applications={item.applications} />
									</TouchableOpacity>
								: null}
							{item.dates
								? // display date of event
									<Text style={styles.dateText}>
										{formatDate(getNextDate(item.dates)) +
											(item.dates.length > 1 ? '...' : '')}
									</Text>
								: null}

							{this.props.distanceCenter
								? // display how far away the event is
									<Text style={styles.distanceText}>
										{Math.round(
											this.getDistance(this.props.distanceCenter, item) / 1000
										) + ' km'}
									</Text>
								: null}
						</TouchableOpacity>}
				/>
				<View style={styles.empty}>
					{this.props.message}
				</View>
			</ScrollView>
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
			{translate(numApplications === 1 ? 'Application' : 'Applications')}
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
		color: 'black'
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
	empty: {
		alignItems: 'center',
		paddingTop: 10
	},
	numAppText: {
		color: 'white',
		backgroundColor: 'transparent'
	}
});
