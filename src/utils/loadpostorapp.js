import firebase from 'firebase';

//Given a valid postID, will open that post within the app
export function goToPost(postID) {
	firebase
		.database()
		.ref('posts')
		.child(postID)
		.once('value')
		.then(postSnap => {
			if (postSnap.exists()) {
				let post = postSnap.val();
				post.key = postSnap.key;
				post.applications = post.applications || {};
				global.setCurrentModal('/PostOrCenterModal', {
					post: post
				});
			}
		});
}

//Given a valid appID, will open that post within the app
export function goToApp(appID) {
	firebase
		.database()
		.ref('applications')
		.child(appID)
		.once('value')
		.then(async appSnap => {
			if (appSnap.exists()) {
				let app = appSnap.val();
				app.key = appSnap.key;
				app.postData = (await firebase
					.database()
					.ref('posts')
					.child(app.post)
					.once('value')).val();

				// Fetch the owner's info so we can display the contact button
				app.owner = (await firebase
					.database()
					.ref('users')
					.child(app.postData.owner)
					.once('value')).val();

				global.setCurrentModal('/ViewSingleApplication', {
					app: app
				});
			}
		});
}
