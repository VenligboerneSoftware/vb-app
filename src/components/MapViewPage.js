import { StyleSheet, View } from 'react-native';
import React from 'react';

import MapView from 'react-native-maps';

import PostOrCenterModal from './PostOrCenterModal';

export default class MapViewPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isPostModalVisible: false,
			mapRegion: props.mapRegion
		};
		this.initialRegion = props.mapRegion;
	}

	setRegion = region => {
		// TODO Handling the region could be done more cleanly with animateToRegion
		// https://github.com/airbnb/react-native-maps/blob/master/docs/mapview.md
		this.setState({ mapRegion: region });
	};

	_showModal = () => this.setState({ isPostModalVisible: true });

	_hideModal = () => this.setState({ isPostModalVisible: false });

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
					}}
					onRegionChangeComplete={mapRegion => {
						this.state.mapRegion = mapRegion;
						if (mapRegion !== this.initialRegion) {
							this.props.onRegionChange(mapRegion);
						}
					}}
					showsUserLocation={true}
					userLocationAnnotationTitle={''}
					rotateEnabled={false}
					pitchEnabled={false}
				>
					{// Render post and center icons
					this.props.listData.map(marker =>
						<MapView.Marker
							key={marker.key}
							coordinate={marker}
							onPress={(mark => {
								this.setState({ selectedPost: mark });
								this._showModal();
							}).bind(this, marker)}
							image={{
								uri: global.db.categories[marker.icon].pinURL
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
