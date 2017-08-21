import Expo from 'expo';

import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

history.listen((location, action) => {
	// location is an object like window.location
	Expo.Amplitude.logEventWithProperties(
		'Navigate to ' + location.pathname,
		location.state || {}
	);
});

export default history;
