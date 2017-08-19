import {
	Dimensions,
	FlatList,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';
import firebase from 'firebase';

import { formatDate, getNextDate } from '../utils/dates';
import { translate } from '../utils/internationalization';
import EventIcon from './EventIcon.js';
import PostOrCenterModal from './PostOrCenterModal';
import SharedStyles from '../styles/SharedStyles';
import ViewApplications from './ViewApplications';

export default class PostList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isPostModalVisible: false,
			selectedPost: null
		};
	}

	_showModal = item =>
		this.setState({ selectedPost: item, isPostModalVisible: true });

	_hideModal = () => this.setState({ isPostModalVisible: false });

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
		// copy to avoid immutablility issues
		console.log('Starting copy', Date.now());
		posts = JSON.parse(JSON.stringify(posts));
		console.log('Copy complete', Date.now());
		if (this.props.sortCenter) {
			posts = posts.map(post => ({
				distance: this.getDistance(this.props.sortCenter, post),
				post: post
			}));
			console.log('Distances calculated', Date.now());
			const sorted = posts
				.sort((a, b) => a.distance - b.distance)
				.map(obj => obj.post);

			console.log('Sort complete', Date.now());
			return sorted;
		} else {
			return posts;
		}
	};

	render() {
		return (
			<View flex={1}>
				<PostOrCenterModal
					isVisible={this.state.isPostModalVisible}
					post={this.state.selectedPost}
					hide={this._hideModal}
				/>

				{/* Modal to go straight to viewApplications */}
				<Modal
					isVisible={this.state.isApplicationsModalVisible}
					animationIn={'zoomIn'}
					animationOut={'zoomOut'}
				>
					<ViewApplications
						hide={() => {
							this.setState({ isApplicationsModalVisible: false });
						}}
						post={this.state.selectedPost}
					/>
				</Modal>
				<ScrollView
					keyboardShouldPersistTaps={'handled'}
					style={{ flex: 1, width: Dimensions.get('window').width }}
				>
					<FlatList
						data={this._sort(this.props.listData)}
						scrollEnabled={false}
						ItemSeparatorComponent={() => <View style={SharedStyles.divider} />}
						renderItem={({ item }) =>
							<TouchableOpacity
								onPress={() => {
									this._showModal(item);
								}}
								style={styles.rowStyles}
							>
								<EventIcon item={item} />

								<Text style={styles.rowText}>
									{item.title}
								</Text>

								{item.owner === firebase.auth().currentUser.uid
									? <TouchableOpacity
											style={styles.applicationCounter}
											onPress={() => {
												this.setState({
													isApplicationsModalVisible: true,
													selectedPost: item
												});
											}}
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
			</View>
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
