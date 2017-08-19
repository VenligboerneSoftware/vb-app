import { Platform, StyleSheet, View } from 'react-native';
import React from 'react';

import MapView from 'react-native-maps';

import PostOrCenterModal from './PostOrCenterModal';

export default class MapViewPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mapRegion: props.mapRegion,
			isPostModalVisible: false,
			listData: []
		};
	}

	componentWillReceiveProps(props) {
		// TODO Is there a non platform specific solution to this?
		// Is the OS really even the determining factor of the behavior?
		if (Platform.OS === 'android') {
			// Clear listData first to fix Android custom icons issue
			this.setState(
				{
					listData: [],
					mapRegion: props.mapRegion
				},
				() => {
					this.setState({ listData: props.listData });
				}
			);
		} else {
			// Clearing listdata causes flashing on iOS
			this.setState({
				listData: props.listData,
				mapRegion: props.mapRegion
			});
		}
	}

	_showModal = post =>
		this.setState({
			isPostModalVisible: true,
			selectedPost: post
		});

	_hideModal = () =>
		this.setState({
			isPostModalVisible: false
		});

	// Includes a region twice the size of the map in each direction.
	// The wide viewport makes scrolling around more pleasant.
	_checkRegion = (post, region) =>
		post.latitude > region.latitude - region.latitudeDelta &&
		post.latitude < region.latitude + region.latitudeDelta &&
		post.longitude > region.longitude - region.longitudeDelta &&
		post.longitude < region.longitude + region.longitudeDelta;

	render() {
		return (
			<View style={styles.container}>
				<PostOrCenterModal
					isVisible={this.state.isPostModalVisible}
					post={this.state.selectedPost}
					hide={this._hideModal}
				/>
				{this.props.listData.length === 0 ? this.props.message : null}
				<MapView
					style={styles.map}
					region={this.state.mapRegion}
					onRegionChange={mapRegion => {
						this.state.mapRegion = mapRegion;

						// Use intervals to detect the end of the drag.
						// Don't use onRegionChangeComplete because it produces
						// weird events for no reason.
						if (this.regionChange) clearInterval(this.regionChange);
						this.regionChange = setTimeout(() => {
							this.props.onRegionChange(this.state.mapRegion);
						}, 200);
						// TODO fiddle with this timing parameter
					}}
					onRegionChangeComplete={mapRegion => {
						this.state.mapRegion = mapRegion;
					}}
					showsUserLocation={true}
					userLocationAnnotationTitle={''}
					rotateEnabled={false}
					pitchEnabled={false}
				>
					{// Render post and center icons
					this.state.listData
						.filter(post => this._checkRegion(post, this.state.mapRegion))
						.map(marker =>
							<MapView.Marker
								key={marker.key}
								coordinate={marker}
								onPress={this._showModal.bind(this, marker)}
								image={{
									uri: global.db.categories[marker.icon].pinURL
								}}
								style={{
									/* keep marker order from flickering (Android only) */
									zIndex: marker.latitude
								}}
							/>
						)}
				</MapView>
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
	map: {
		alignSelf: 'stretch',
		height: '100%',
		flex: 1
	}
});
