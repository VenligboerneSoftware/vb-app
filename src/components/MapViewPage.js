import { StyleSheet, View } from 'react-native';
import React from 'react';

import MapView from 'react-native-maps';

import PostOrCenterModal from './PostOrCenterModal';

export default class MapViewPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mapRegion: props.mapRegion,
			isPostModalVisible: false
		};
	}

	componentWillReceiveProps(props) {
		this.setState({ mapRegion: props.mapRegion });
	}

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
