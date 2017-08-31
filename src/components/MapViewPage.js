import { StyleSheet, View } from 'react-native';
import React from 'react';

import MapView from 'react-native-maps';

export default class MapViewPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mapRegion: props.mapRegion,
			listData: props.listData
		};
	}

	componentWillReceiveProps(props) {
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
		global.setCurrentModal('/PostOrCenterModal', {
			post: post
		});

	// If checkOutsideRegion, includes a region twice the size of the map in each direction.
	// The wide viewport makes scrolling around more pleasant.
	_checkRegion = (post, region, checkOutsideRegion) => {
		if (!checkOutsideRegion) {
			return (
				post.latitude > region.latitude - region.latitudeDelta / 2 &&
				post.latitude < region.latitude + region.latitudeDelta / 2 &&
				post.longitude > region.longitude - region.longitudeDelta / 2 &&
				post.longitude < region.longitude + region.longitudeDelta / 2
			);
		} else {
			return (
				post.latitude > region.latitude - region.latitudeDelta &&
				post.latitude < region.latitude + region.latitudeDelta &&
				post.longitude > region.longitude - region.longitudeDelta &&
				post.longitude < region.longitude + region.longitudeDelta
			);
		}
	};

	render() {
		const postsNearMap = this.state.listData.filter(post =>
			this._checkRegion(post, this.state.mapRegion, true)
		);
		const postsInMapRegion = postsNearMap.filter(post =>
			this._checkRegion(post, this.state.mapRegion, false)
		);
		return (
			<View style={styles.container}>
				{postsInMapRegion.length === 0 ? this.props.message : null}
				<MapView
					style={styles.map}
					region={this.state.mapRegion}
					provider={'google'}
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
						console.log(Date.now(), 'RegionChangeComplete');
					}}
					showsUserLocation={true}
					userLocationAnnotationTitle={''}
					rotateEnabled={false}
					pitchEnabled={false}
				>
					{// Render post and center icons
					postsNearMap.map(marker =>
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
