import Moment from 'moment';
import * as firebase from 'firebase';

export function getNextDate(dates) {
	let sortedDates = getSortedUpcomingDates(dates);

	return sortedDates ? sortedDates[0] : null;
}

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

export function formatDate(timestamp) {
	return Moment.unix(timestamp / 1000).format('DD/MM/YYYY');
}

export function sortedDatesString(dates) {
	let sortedDates = getSortedUpcomingDates(dates);
	return sortedDates.map(date => formatDate(date)).join(', ');
}

export function checkFilters(dates, start, end) {
	// console.log(dates, start, end);
	if (!start || !end) {
		return true;
	}
	if (!dates) {
		return false;
	}
	dates = dates.filter(date => {
		console.log('date', Moment.unix(date / 1000));
		console.log('before', Moment.parseZone(start));
		console.log('after', Moment.parseZone(end));
		return (
			(Moment.unix(date / 1000).isAfter(start) ||
				Moment.unix(date / 1000).isSame(start)) &&
			(Moment.unix(date / 1000).isBefore(end) ||
				Moment.unix(date / 1000).isSame(end))
		);
	});
	console.log(dates);
	return dates.length > 0;
}

export function datetimeToDates() {
	firebase.database().ref('posts').once('value', snap => {
		snap.forEach(post => {
			if (post.hasChild('datetime')) {
				post.ref.child('dates').set([post.val().datetime]);
				post.ref.child('datetime').remove();
			}
		});
	});
}
