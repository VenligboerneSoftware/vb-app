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

import { translate } from '../utils/internationalization';
import EventIcon from './EventIcon.js';
import PostOrCenterModal from './PostOrCenterModal';
import SharedStyles from '../styles/SharedStyles';
import ViewApplications from './ViewApplications';

import { formatDate, getNextDate } from '../utils/dates';

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
				<ScrollView style={{ flex: 1, width: Dimensions.get('window').width }}>
					<FlatList
						data={this.props.listData}
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

								{item.distance
									? // display how far away the event is
										<Text style={styles.distanceText}>
											{Math.round(item.distance / 1000) + ' km'}
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
		margin: 10,
		paddingTop: 0,
		paddingBottom: 0
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
		right: 3,
		bottom: 16
	},
	distanceText: {
		position: 'absolute',
		right: 3,
		bottom: -5
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
