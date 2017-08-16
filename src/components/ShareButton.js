import { StyleSheet, TouchableOpacity, Share, Text } from 'react-native';
import Expo from 'expo';
import { EvilIcons } from '@expo/vector-icons';
import React from 'react';

import { translate } from 'venligboerneapp/src/utils/internationalization.js';

export default class ShareButton extends React.Component {
	constructor(props) {
		super(props);
	}

	// Converts object into query string format
	_serialize = function(obj) {
		var str = [];
		for (var p in obj) {
			if (obj.hasOwnProperty(p)) {
				str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
			}
		}
		return str.join('&');
	};

	// Open a Facebook share dialog in the web browser populated with a deep link
	// to this.props.deepLink with the string this.props.quote
	_share = async () => {
		const redirectHost = 'http://venligboerne-app.herokuapp.com/app?';
		const url =
			redirectHost +
			this._serialize({
				url: Expo.Constants.linkingUri + this.props.deepLink
			});

		// Shortened link. We can use this if we want to let the user share by other means.
		let shortURL = await fetch(
			'http://tinyurl.com/api-create.php?url=' + encodeURIComponent(url)
		);
		console.log('Short URL', shortURL._bodyInit);
		this.setState({ shareURL: shortURL._bodyInit });

		Share.share({
			message:
				translate('Here is a post in the Venligboerne App I wanted to share!') +
				'\n\n' +
				this.props.title +
				':  ' +
				this.props.description +
				'\n\n' +
				this.state.shareURL,
			title: this.props.title //doesn't seem to show up anywhere...
		});
	};

	render() {
		return (
			<TouchableOpacity onPress={this._share} style={styles.share}>
				<EvilIcons name={'share-apple'} size={45} />
				<Text style={styles.text}>
					{translate('Share')}
				</Text>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	share: {
		position: 'absolute',
		top: 9,
		left: 10,
		zIndex: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		backgroundColor: 'transparent'
	},
	text: {
		fontSize: 18,
		fontWeight: '400'
	}
});
