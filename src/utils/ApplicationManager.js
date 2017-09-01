import firebase from 'firebase';

export function createApplication(application) {
	// Don't actually push the data, just figure out what the unique ID is going
	// to be
	const applicationKey = firebase.database().ref('applications').push().key;
	return updateApplication(application, applicationKey, true);
}

export function deleteApplication(application) {
	// TODO decide how we want to handle -- can people reapply or do
	// we just change status to denied and then does that create a permissions
	// issue?
	return updateApplication(application, application.key, null);
}

/**
 * Generic function which an create or delete an application depending on its parameters.
 * Performs three writes to the database in one transaction.
 * It is important the three writes are in one transaction to avoid broken
 * database states if some of them succeed but some fail. With update, they
 * all succeed or fail together.
 * For more insight on why the database is designed this way, see
 * https://www.airpair.com/firebase/posts/structuring-your-firebase-data
 *
 * @param {Object} application An object containing the application's fields
 * @param {String} key The key in the database of the application
 * @param {Boolean} value true, to create, or null, to delete
 * @returns {Null} null
 */
function updateApplication(application, key, value) {
	let updatePacket = {};
	// If we are creating, set it to the application. Otherwise, setting it to
	// null deletes it.
	updatePacket['applications/' + key] = value ? application : null;

	// Update the application's ID from the user who is submitting it
	updatePacket[
		'users/' + application.applicant + '/applications/' + key
	] = value;

	// Update the application's ID from the post it is being submitted on
	updatePacket['posts/' + application.post + '/applications/' + key] = value;

	return firebase.database().ref().update(updatePacket);
}
