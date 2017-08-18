import { createMemoryHistory } from 'history';

const history = createMemoryHistory({
	initialEntries: ['/startup'],
	initialIndex: 0
});

history.listen((location, action) => {
	// location is an object like window.location
	console.log(action, location.pathname, location.state);
	Expo.Amplitude.logEventWithProperties(
		'Navigate to ' + location.pathname,
		location.state || {}
	);
});

export default history;
