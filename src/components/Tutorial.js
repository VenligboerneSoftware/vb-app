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
							{slide.textBig !== ''
								? <View style={styles.textContainerTop}>
										<Text style={styles.textBig}>
											{slide.textBig}
										</Text>
									</View>
								: null}
							{slide.textSmall !== ''
								? <View style={styles.textContainerBottom}>
										<Text style={styles.textSmall}>
											{slide.textSmall}
										</Text>
									</View>
								: null}
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
const numSlides = 17;

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
	textContainerTop: {
		backgroundColor: Colors.grey.dark,
		zIndex: 10,
		position: 'absolute',
		bottom: '30%'
	},
	textContainerBottom: {
		backgroundColor: Colors.grey.dark,
		zIndex: 10,
		position: 'absolute',
		bottom: '20%'
	},
	textBig: {
		padding: 10,
		color: Colors.white,
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	textSmall: {
		padding: 10,
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
		backgroundColor: 'rgba(52, 52, 52, .99)',
		borderRadius: 25
	},
	doneButtonText: {
		fontSize: 30,
		color: '#fff',
		paddingVertical: 20,
		paddingHorizontal: 60
	},
	prevNextButton: {
		paddingVertical: 30
	},
	prevNextButtonText: {
		fontSize: 60,
		color: '#007aff'
	}
});

const slides = [
	{
		num: 0,
		image: require('../../assets/images/tutorial/0.png'),
		textBig: 'Welcome to The Venligboerne App Tutorial',
		textSmall: 'Slide the screen to the right to continue'
	},
	{
		num: 1,
		image: require('../../assets/images/tutorial/1.png'),
		textBig: 'Below is the tab navigator.',
		textSmall: 'You will use it to switch between pages within the app'
	},
	{
		num: 2,
		image: require('../../assets/images/tutorial/2.png'),
		textBig: 'This is the Map page',
		textSmall: 'Here, you can see posts around you.'
	},
	{
		num: 3,
		image: require('../../assets/images/tutorial/3.png'),
		textBig: 'Above is the filter bar',
		textSmall: 'Click on an icon to show only posts from that category'
	},
	{
		num: 4,
		image: require('../../assets/images/tutorial/4.png'),
		textBig: '',
		textSmall: 'Click on a pin to show information about that post.'
	},
	{
		num: 5,
		image: require('../../assets/images/tutorial/5.png'),
		textBig: '',
		textSmall:
			'Here you can view information about the post and share the post with friends'
	},
	{
		num: 6,
		image: require('../../assets/images/tutorial/6.png'),
		textBig: '',
		textSmall: 'You can apply to a post to contact the owner'
	},
	{
		num: 7,
		image: require('../../assets/images/tutorial/7.png'),
		textBig: 'This is the List Page',
		textSmall: 'Another way to find posts around you'
	},
	{
		num: 8,
		image: require('../../assets/images/tutorial/8.png'),
		textBig: '',
		textSmall: 'Click on a Venligbo Café to show information about it'
	},
	{
		num: 9,
		image: require('../../assets/images/tutorial/9.png'),
		textBig: '',
		textSmall:
			'This is the Create Post Page.  Click on a category to get started'
	},
	{
		num: 10,
		image: require('../../assets/images/tutorial/10.png'),
		textBig: '',
		textSmall: 'Then, fill out the required information about your post'
	},
	{
		num: 11,
		image: require('../../assets/images/tutorial/11.png'),
		textBig: 'This is the News page',
		textSmall: 'Stay updated on the latest Venligboerne Articles'
	},
	{
		num: 12,
		image: require('../../assets/images/tutorial/12.png'),
		textBig: 'This is the My Posts page of your profile',
		textSmall: "Here you can see the posts that you've created"
	},
	{
		num: 13,
		image: require('../../assets/images/tutorial/13.png'),
		textBig: 'This is the My Applications page of your profile',
		textSmall: "Here you can see all the posts that you've applied to"
	},
	{
		num: 14,
		image: require('../../assets/images/tutorial/14.png'),
		textBig: 'This is the Change Language button',
		textSmall: 'You can switch language on any page'
	},
	{
		num: 15,
		image: require('../../assets/images/tutorial/15.png'),
		textBig: 'This is the Menu button',
		textSmall:
			'Here, you will find more features, including this tutorial if you want to rewatch it'
	},
	{
		num: 16,
		image: require('../../assets/images/tutorial/16.png'),
		textBig: '',
		textSmall: ''
	}
];
