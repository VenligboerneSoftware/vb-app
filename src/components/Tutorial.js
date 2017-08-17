import Swiper from 'react-native-swiper';

import { StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import React, { Component } from 'react';
import history from '../utils/history.js';
import Colors from '../styles/Colors';

export default class ExitBar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLastSlide: false,
			finishedLoading: false
		};
	}

	_checkLastSlide = index => {
		this.setState({ isLastSlide: index === numSlides - 1 ? true : false });
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
					{slides.map(slide =>
						<View key={slide.num} style={styles.container}>
							<Text style={{ position: 'absolute', top: '49%', fontSize: 25 }}>
								Loading...
							</Text>
							<Image
								style={styles.screenshot}
								resizeMode={'contain'}
								source={slide.image}
							/>
							<Text style={styles.textBig}>
								{slide.textBig}
							</Text>
							<Text style={styles.textSmall}>
								{slide.textSmall}
							</Text>
						</View>
					)}
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
const numSlides = 16;
const slides = [
	{
		num: 0,
		image: require('../../assets/images/tutorial/0.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 1,
		image: require('../../assets/images/tutorial/1.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 2,
		image: require('../../assets/images/tutorial/2.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 3,
		image: require('../../assets/images/tutorial/3.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 4,
		image: require('../../assets/images/tutorial/4.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 5,
		image: require('../../assets/images/tutorial/5.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 6,
		image: require('../../assets/images/tutorial/6.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 7,
		image: require('../../assets/images/tutorial/7.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 8,
		image: require('../../assets/images/tutorial/8.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 9,
		image: require('../../assets/images/tutorial/9.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 10,
		image: require('../../assets/images/tutorial/10.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 11,
		image: require('../../assets/images/tutorial/11.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 12,
		image: require('../../assets/images/tutorial/12.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 13,
		image: require('../../assets/images/tutorial/13.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 14,
		image: require('../../assets/images/tutorial/14.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	},
	{
		num: 15,
		image: require('../../assets/images/tutorial/15.png'),
		textBig: 'Text Big Test',
		textSmall: 'Text Small Test'
	}
];

const styles = StyleSheet.create({
	wrapper: {},
	container: {
		flex: 1,
		// backgroundColor: Colors.grey.light,
		width: '100%',
		height: '100%',
		backgroundColor: 'transparent',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	screenshot: {
		width: '80%'
	},
	textBig: {
		width: '75%',
		zIndex: 10,
		position: 'absolute',
		top: '15%',
		color: Colors.white,
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	textSmall: {
		width: '80%',
		zIndex: 10,
		position: 'absolute',
		top: '65%',
		color: Colors.white,
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	skipButton: {
		position: 'absolute',
		top: 20,
		right: 20,
		zIndex: 10,
		backgroundColor: 'rgba(52, 52, 52, 0.2)',
		borderRadius: 15
	},
	skipButtonText: {
		fontSize: 16,
		color: 'black',
		paddingVertical: 12,
		paddingHorizontal: 20
	},
	doneButton: {
		position: 'absolute',
		bottom: 80,
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
