import Expo from 'expo';

import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

history.listen((location, action) => {
	// location is an object like window.location
	let state = location.state || {};
	if (typeof state !== 'object') {
		console.warn('Logging event with invalid properties', state);
		state = {};
	}
	Expo.Amplitude.logEventWithProperties(
		'Navigate to ' + location.pathname,
		state
	);
});

export default history;
