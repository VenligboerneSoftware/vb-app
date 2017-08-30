// Function: authenticate
//-----------------------------------------------------------------------
// Authenticates token with firebase server and returns
// a firebase.promise (guaranteed to be an eventual value)
// containing a non-null firebase user. Will throw an error
// if token is invalid/malformed.
//
// More on a firebase.promise:
// https://firebase.google.com/docs/reference/js/firebase.Promise#Promise
import firebase from 'firebase';

export async function authenticate(token) {
	const provider = firebase.auth.FacebookAuthProvider;
	const credential = provider.credential(token);
	return await firebase.auth().signInWithCredential(credential);
}
