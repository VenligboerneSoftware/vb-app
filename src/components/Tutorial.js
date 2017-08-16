import Swiper from 'react-native-swiper';

import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import React, { Component } from 'react';
import history from '../utils/history.js';
import Colors from '../styles/Colors';

export default class ExitBar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLastSlide: false
		};
	}

	_checkLastSlide = index => {
		const lastSlide = 2;
		this.setState({ isLastSlide: index === lastSlide ? true : false });
	};

	_goHome = () => {
		history.push('/homepage');
	};

	render() {
		return (
			//TODO: require images, update lastSlide in _checkLastSlide
			<View style={{ flex: 1 }}>
				<Swiper
					style={styles.wrapper}
					showsButtons={true}
					loop={false}
					onIndexChanged={index => this._checkLastSlide(index)}
					nextButton={
						<View style={[styles.prevNextButton, { paddingLeft: 30 }]}>
							<Text style={styles.prevNextButtonText}>›</Text>
						</View>
					}
					prevButton={
						<View style={[styles.prevNextButton, { paddingRight: 30 }]}>
							<Text style={styles.prevNextButtonText}>‹</Text>
						</View>
					}
				>
					<View style={styles.slide1}>
						<Text style={styles.text}>Hello Swiper</Text>
					</View>
					<View style={styles.slide2}>
						<Text style={styles.text}>Beautiful</Text>
					</View>
					<View style={styles.slide3}>
						<Text style={styles.text}>And simple</Text>
					</View>
				</Swiper>
				<TouchableOpacity
					style={this.state.isLastSlide ? styles.doneButton : styles.skipButton}
					onPress={this._goHome}
				>
					<Text
						style={
							this.state.isLastSlide
								? styles.doneButtonText
								: styles.skipButtonText
						}
					>
						{this.state.isLastSlide ? 'go to app!' : 'skip tutorial'}
					</Text>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	wrapper: {},
	slide1: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#9DD6EB'
	},
	slide2: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#97CAE5'
	},
	slide3: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#92BBD9'
	},
	text: {
		color: '#fff',
		fontSize: 30,
		fontWeight: 'bold'
	},
	skipButton: {
		position: 'absolute',
		bottom: 20,
		right: 20,
		zIndex: 10,
		backgroundColor: 'rgba(52, 52, 52, 0.2)',
		borderRadius: 15
	},
	skipButtonText: {
		fontSize: 16,
		color: '#fff',
		paddingVertical: 12,
		paddingHorizontal: 20
	},
	doneButton: {
		position: 'absolute',
		bottom: 50,
		zIndex: 10,
		alignSelf: 'center',
		backgroundColor: 'rgba(52, 52, 52, 0.2)',
		borderRadius: 15
	},
	doneButtonText: {
		fontSize: 30,
		color: '#fff',
		paddingVertical: 16,
		paddingHorizontal: 24
	},
	prevNextButton: {
		paddingVertical: 30
	},
	prevNextButtonText: {
		fontSize: 60,
		color: '#007aff'
	}
});
