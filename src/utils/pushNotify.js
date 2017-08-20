// pushNotify
// ------------------------------------------------------------------------
// Pass an array of tokens (or a single token), which should look like
// "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]", and a string dictatating the body
// of the notification, and all of the clients corresponding to those tokens will
// be push notified. Sending multiple notifications at once instead of one at
// a time is prefered for performance reasons.
//
// Push notifications:
// https://docs.expo.io/versions/v16.0.0/guides/push-notifications.html
//
// The fetch function for POST request:
// https://facebook.github.io/react-native/docs/network.html
export default function pushNotify(tokens, messageSubject, postTitle, data) {
	// Allow user to pass a single token
	if (tokens.constructor !== Array) {
		tokens = [tokens];
	}

	fetch('https://exp.host/--/api/v2/push/send', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(
			tokens.map(token => {
				return {
					to: token,
					sound: 'default',
					title: messageSubject,
					body: postTitle,
					data: data
				};
			})
		)
	}).then(function(response) {
		console.log('Expo push notification returned', response._bodyText);
	});
}
