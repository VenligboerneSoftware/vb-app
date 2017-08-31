// Renders a MapView with a circle approximating the location of
// the event with a circle. Requires latitude and longitude props

import { MapView } from 'expo';
import { StyleSheet } from 'react-native';
import React from 'react';

export default class MapWithCircle extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<MapView
				style={styles.map}
				provider={'google'}
				region={{
					latitude: this.props.latitude,
					longitude: this.props.longitude,
					latitudeDelta: 0.1,
					longitudeDelta: 0.2
				}}
				scrollEnabled={false}
				zoomEnabled={false}
				rotateEnabled={false}
			>
				<MapView.Circle
					//key forces iOS refresh
					key={(this.props.latitude + this.props.longitude).toString()}
					center={{
						latitude: this.props.latitude,
						longitude: this.props.longitude
					}}
					radius={1500}
					fillColor={'rgba(72,209,204, 0.4)'}
					strokeColor={'transparent'}
				/>
			</MapView>
		);
	}
}

const styles = StyleSheet.create({
	map: {
		alignSelf: 'stretch',
		height: 250,
		margin: 20
	}
});
