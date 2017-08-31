import Moment from 'moment';

//returns the datetime of the next coming date in the dates array
export function getNextDate(dates) {
	let sortedDates = getSortedUpcomingDates(dates);

	return sortedDates ? sortedDates[0] : null;
}

//returns a sorted array of next coming dates
export function getSortedUpcomingDates(dates) {
	if (!dates) {
		return null;
	}

	let upcomingDates = dates.filter(date => {
		return Moment.unix(date).isAfter(Moment.now());
	});

	let sortedDates = upcomingDates.sort((a, b) => {
		return Moment.unix(a).diff(Moment.unix(b));
	});

	return sortedDates;
}

//returns a string formatted like DD/MM/YYYY
export function formatDate(timestamp) {
	return Moment(timestamp)
		.utc()
		.format('DD/MM/YYYY');
}

//returns a sorted string of dates separated by a comma
export function sortedDatesString(dates) {
	let sortedDates = getSortedUpcomingDates(dates);
	return sortedDates.map(date => formatDate(date)).join(', ');
}

//returns a true if the filters arent set or if there is at least one date
//that is in the date range
export function checkFilters(dates, start, end) {
	if (!start || !end) {
		return true;
	}
	if (!dates) {
		return false;
	}
	dates = dates.filter(date => {
		return (
			(Moment.unix(date / 1000).isAfter(start) ||
				Moment.unix(date / 1000).isSame(start)) &&
			(Moment.unix(date / 1000).isBefore(end) ||
				Moment.unix(date / 1000).isSame(end))
		);
	});
	return dates.length > 0;
}

//Firebase Util code that converts all datetimes to arrays of datetimes.
// export function datetimeToDates() {
// 	firebase.database().ref('posts').once('value', snap => {
// 		snap.forEach(post => {
// 			if (post.hasChild('datetime')) {
// 				post.ref.child('dates').set([post.val().datetime]);
// 				post.ref.child('datetime').remove();
// 			}
// 		});
// 	});
// }
