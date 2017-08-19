import { Platform, StyleSheet, View } from 'react-native';
import React from 'react';

import MapView from 'react-native-maps';

import PostOrCenterModal from './PostOrCenterModal';

export default class MapViewPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mapRegion: props.mapRegion,
			listData: props.listData,
			isPostModalVisible: false
		};
	}

	componentWillReceiveProps(props) {
		console.log('new props', props.mapRegion, props.listData.length);
		// TODO what if listData and mapRegion update simultaneously?
		if (this.props.listData === props.listData) {
			this.setState({
				mapRegion: props.mapRegion
			});
		} else {
			this.setState({
				listData: props.listData
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
						if (this.regionChange) {
							clearInterval(this.regionChange);
						}
						// TODO no need to live update this
						this.regionChange = setTimeout(() => {
							this.props.onRegionChange(this.state.mapRegion);
						}, 200);
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
