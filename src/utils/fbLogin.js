// Function: authenticate
//-----------------------------------------------------------------------
// Authenticates token with firebase server and returns
// a firebase.promise (guaranteed to be an eventual value)
// containing a non-null firebase user. Will throw an error
// if token is invalid/malformed.
//
// More on a firebase.promise:
// https://firebase.google.com/docs/reference/js/firebase.Promise#Promise
import { Alert, AsyncStorage } from 'react-native';
import firebase from 'firebase';

import history from './history';

export async function authenticate(token) {
	const provider = firebase.auth.FacebookAuthProvider;
	const credential = provider.credential(token);
	return await firebase.auth().signInWithCredential(credential);
}

// Function: attemptLoginWithStoredToken
//------------------------------------------------
// Tries to log into the user's account using a token
// stored in local storage if available. Otherwise,
// if token is invalid, deletes the user's token from
// the database and redirects to a regular login.
export async function attemptLoginWithStoredToken(token, afterLogin) {
	// TODO Make sure all invalid token handling covered
	global.token = token;
	return authenticate(token).catch(error => {
		console.error('Facebook authentication error', error);
		AsyncStorage.removeItem('token');
		Alert.alert('Your Facebook login failed!', 'Please log in again!');
		AsyncStorage.getItem('eula').then(agreedToEula => {
			history.push('/FacebookAuth', {
				onDone: afterLogin,
				eula: !agreedToEula
			});
		});
	});
}
