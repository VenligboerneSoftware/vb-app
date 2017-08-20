// These scripts are not part of the app. They are for development use only.

import { Alert } from 'react-native';
import firebase from 'firebase';

import { createApplication } from './ApplicationManager.js';
import mortonize from './mortonize';

// WARNING This destroys the contents of the database. Do not use it lightly.
// Repopulate the database with randomly generated users, posts, and applications.
// It scatters events randomly across a rectangle containing Denmark.
export function populateDB(numUsers, numPosts, numApplications) {
	const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];
	Alert.alert(
		'WARNING',
		'Are you sure you would like to CLEAR THE DATABASE? Make sure you take a backup first.',
		[
			{
				text: 'Continue',
				onPress: async () => {
					await firebase.database().ref('posts').remove();
					await firebase.database().ref('applications').remove();
					await firebase.database().ref('users').remove();
					console.log('Cleared stuff');

					const categories = Object.keys(
						(await firebase.database().ref('categories').once('value')).val()
					);

					const initialUsers = {
						FNuDynYSOfYFz5HWGrFSiP6y2Wm2: {
							displayName: 'Administrator',
							facebookUID: '1831544803539124',
							permissions: 'superuser',
							photoURL:
								'https://scontent.xx.fbcdn.net/v/t1.0-1/s100x100/18951508_1795380283822243_3207296857840408456_n.jpg?oh=2612ab33960a9c3b3e2bfe01b198e054&oe=59CEBE7F',
							pushToken: 'ExponentPushToken[5U2RBmCCqEifkbFRuWxlLW]'
						}
					};
					let users = Object.keys(initialUsers);
					await firebase.database().ref('users').set(initialUsers);

					while (users.length < numUsers) {
						users.push(
							firebase.database().ref('users').push({
								facebookUID: Math.round(Math.random() * 10000000000),
								permissions: 'normal',
								pushToken: 'ExponentPushToken[sjdfalsjfa;lsdjkf;alsjd]',
								displayName: 'John Smith',
								photoURL:
									'https://scontent.xx.fbcdn.net/v/t1.0-1/p100x100/12189054_10208486144178157_2373957910987270490_n.jpg?oh=ca5091ca5ec249be583e652874ac5a16&oe=59FAAFC4'
							}).key
						);
					}
					console.log('Added users', users.length);

					let posts = [];
					for (let i = 0; i < numPosts; i++) {
						const latitude = Math.random() * 4 + 54;
						const longitude = Math.random() * 5 + 8;
						const index = mortonize(latitude, longitude);
						posts.push(
							firebase.database().ref('posts').push({
								latitude: latitude,
								longitude: longitude,
								index: index,
								icon: randomElement(categories),
								title: 'Title ' + i,
								description: (' Long description ' + i).repeat(10),
								datetime:
									Math.random() < 0.1
										? 1499439677 + Math.random() * 100000000
										: null,
								owner: randomElement(users)
							}).key
						);
					}

					console.log('Added posts', posts.length);

					for (var i = 0; i < numApplications; i++) {
						createApplication({
							applicant: randomElement(users),
							post: randomElement(posts),
							message: 'asldfja;sldjga;lsdfja;sldfja;ldsj',
							status: ['Applied', 'Accepted', 'Rejected'][
								Math.floor(Math.random() * 3)
							]
						});
					}
					console.log('Added applications', numApplications);
				}
			},
			{ text: 'Cancel' }
		]
	);
}

// Fix all indices and inconsistent states
export function refreshIndices() {
	// Clear old indices
	firebase.database().ref('posts').on('child_added', snap => {
		snap.ref.child('applications').remove();
	});

	firebase.database().ref('users').on('child_added', snap => {
		snap.ref.child('applications').remove();
	});

	// Add new indices
	firebase.database().ref('applications').on('child_added', applicationSnap => {
		const key = applicationSnap.key;
		let application = applicationSnap.val();
		if (!application.post) {
			console.log('Incomplete application', application);
			// Incomplete application. Remove it.
			applicationSnap.ref.remove();
			return;
		}

		firebase
			.database()
			.ref('posts')
			.child(application.post)
			.once('value', snap => {
				if (!snap.exists()) {
					// The post this application was to is gone. Delete the application
					applicationSnap.ref.remove();
				} else {
					let updatePacket = {};

					// Add the application's ID to the user who is submitting it
					updatePacket[
						'users/' + application.applicant + '/applications/' + key
					] = true;

					// Add the application's ID to the post it is being submitted on
					updatePacket[
						'posts/' + application.post + '/applications/' + key
					] = true;

					console.log('Adding new application and indices', updatePacket);
					firebase.database().ref().update(updatePacket);
				}
			});
	});
}
