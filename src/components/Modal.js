import Expo from 'expo';
import RNModal from 'react-native-modal';
import React from 'react';

export default class Modal extends React.Component {
	componentWillReceiveProps = props => {
		if (!this.props.isVisible && props.isVisible) {
			console.log(
				'Showing Modal',
				props.children.type.displayName,
				props.children.props
			);
			Expo.Amplitude.logEvent(
				`Showing Modal ${props.children.type.displayName}`
			);
		} else if (this.props.isVisible && !props.isVisible) {
			console.log('Hiding Modal');
			Expo.Amplitude.logEvent(
				`Showing Modal ${props.children.type.displayName}`
			);
		}
	};

	render() {
		return <RNModal {...this.props} />;
	}
}
