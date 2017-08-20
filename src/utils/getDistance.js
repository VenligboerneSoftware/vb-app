// Rather inaccurate, but very fast, geodistance function
export default (a, b) => {
	const deltaLatitude = a.latitude - b.latitude;
	const deltaLongitude =
		(a.longitude - b.longitude) * Math.cos(a.latitude / 180.0 * Math.PI);
	const totalDegrees = Math.sqrt(
		deltaLatitude * deltaLatitude + deltaLongitude * deltaLongitude
	);
	// 111319 is the width of one degree latitude in meters
	return totalDegrees * 111319;
};
