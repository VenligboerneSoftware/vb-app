import Expo from 'expo';
import RNModal from 'react-native-modal';
import React from 'react';

export default class Modal extends React.Component {
	componentWillReceiveProps = props => {
		if (!this.props.isVisible && props.isVisible) {
			// TODO log the props as well so we can see what post/application/article/
			// whatever was viewed
			Expo.Amplitude.logEvent('Opened Menu');
		} else if (this.props.isVisible && !props.isVisible) {
			Expo.Amplitude.logEvent('Closed Menu');
		}
	};

	render() {
		return <RNModal hideOnBack={false} {...this.props} />;
	}
}
