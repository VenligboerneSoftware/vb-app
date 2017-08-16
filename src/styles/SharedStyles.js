import Colors from './Colors.js';

export default {
	button: {
		backgroundColor: Colors.grey.medium,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: Colors.grey.dark,
		paddingTop: 8,
		paddingBottom: 8,
		width: '80%',
		alignItems: 'center',
		alignSelf: 'center'
	},
	exit: {
		position: 'absolute',
		top: 10,
		right: 10,
		zIndex: 10
	},
	back: {
		position: 'absolute',
		top: 5,
		left: 15,
		zIndex: 10,
		backgroundColor: 'transparent'
	},
	fullscreen: {
		position: 'absolute',
		margin: 0,
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	},
	divider: {
		height: 1.5,
		width: '80%',
		backgroundColor: Colors.grey.medium,
		alignSelf: 'center'
	},
	fixedBottomButton: {
		paddingBottom: 10,
		paddingTop: 10,
		backgroundColor: Colors.grey.light,
		borderColor: Colors.grey.medium,
		borderWidth: 1,
		width: '100%'
	},
	message: {
		textAlign: 'center', //Change to right for arabic/farsi
		color: '#8A8A8A',
		margin: 15,
		marginLeft: 20,
		marginRight: 20,
		fontSize: 15
	}
};
