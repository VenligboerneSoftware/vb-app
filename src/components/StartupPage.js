import { View, Image, StyleSheet, Text } from 'react-native';
import * as Progress from 'react-native-progress';
import React from 'react';

export default class StartupPage extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<Image
					source={require('../../assets/images/home_background.png')}
					style={styles.gradient}
				>
					<Image
						source={require('../../assets/images/logo.png')}
						style={styles.logo}
					/>
					<Text style={styles.displayText}>
						{this.props.displayText}
					</Text>
					<View style={styles.loadingCircle}>
						<Progress.Circle
							size={60}
							indeterminate={true}
							color={'rgba(255, 255, 255, 0.3)'}
							thickness={100}
						/>
					</View>
				</Image>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
		height: '100%',
		backgroundColor: 'transparent',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	loadingCircle: {
		width: '95%',
		flex: 1,
		alignSelf: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		flexDirection: 'row'
	},
	logo: {
		width: '90%',
		marginTop: '20%',
		flex: 3.5,
		resizeMode: 'contain',
		alignSelf: 'center'
	},
	gradient: {
		width: '100%',
		height: '100%'
	},
	displayText: {
		fontSize: 24,
		color: '#fff',
		textAlign: 'center',
		flex: 1,
		marginLeft: 5
	}
});
