// Utility class to fetch translated versions of various strings used in the app

// put
// import { translate, getAvailableLanguages } from '../utils/internationalization';
// at the top of any file that needs these functions. Then you can call them directly.
// Never use strings directly which will be user facing. Call
// translate("Your String")

import { AsyncStorage, I18nManager } from 'react-native';
import Expo from 'expo';
import * as firebase from 'firebase';
import * as queryString from 'query-string';

import { getCode } from './languages.js';
import APIKeys from './APIKeys.js';

// translate
// --------------------------------------------------------------------
// The word is the key into the Firebase language table. Returns the
// given word in the given language. If the language table has not yet
// loaded, it returns the word parameter.
export function translate(word, language) {
	// Default to global language setting
	language = language || global.language;

	if (!(typeof word === 'string')) {
		console.error('Non string input to translate', word);
		return '';
	}

	// Certain characters are illegal in Firebase keys. Strip them.
	let key = word
		.replace(/\./g, '')
		.replace(/#/g, '')
		.replace(/\$/g, '')
		.replace(/\[/g, '')
		.replace(/\]/g, '');

	if (!global.db.language) {
		// If the database hasn't loaded, just return the key
		// (which is probably the English translation)
		return word;
	} else if (!global.db.language[key] || !global.db.language[key][language]) {
		// If the translation isn't available, add it to the database and automatically
		// translate it.
		console.log('Translation for', word, 'is unavailable');

		// TODO remove this when dev is over
		if (!global.db.language[key]) {
			// Add a new entry to the translation table with google translated values.
			translateToAll(word, key).then(newWordEntry => {
				global.db.language[key] = newWordEntry;
				firebase.database().ref('language/' + key).set(newWordEntry);
				console.log('Automatically translated', word, newWordEntry);
			});
		}

		return word;
	} else {
		var translation = global.db.language[key][language];
		if (translation.charAt(0) === '~') {
			translation = translation.slice(1);
		}
		firebase.database().ref('language').child(key).update({
			'.priority': Date.now()
		});
		return translation;
	}
}

// addNewWord
// -----------------------------------------------------------------------------
// If an unknown word is encountered, automatically translate it to all available
// languages and add it to the database.
export async function translateToAll(word, key) {
	const languages = getAvailableLanguages();
	let newWordEntry = {};
	for (var i = 0; i < languages.length; i++) {
		newWordEntry[languages[i].English] = '';
		if (languages[i].English === 'English') {
			newWordEntry.English = word;
		} else {
			const targetLanguageCode = getCode(languages[i].English);
			// the language is not supported
			if (!targetLanguageCode) {
				console.warn(
					'Language not supported for translation',
					languages[i].English
				);
				continue;
			}
			const response = await googleTranslate(word, 'en', targetLanguageCode);
			if (response.data !== undefined) {
				newWordEntry[languages[i].English] =
					'~' + response.data.translations[0].translatedText;
			} else {
				console.warn('Invalid response to translate request', response);
			}
		}
	}
	return newWordEntry;
}

// googleTranslate
// -----------------------------------------------------------------------------
// Use the Google Cloud translate API to translate the given text from one
// language to another. The source and target are expected to be 2 leter language
// codes. Quota 2,000,000 characters per day.
export async function googleTranslate(word, sourceLanguage, targetLanguage) {
	const options = {
		q: word,
		source: sourceLanguage,
		target: targetLanguage,
		format: 'text',
		key: APIKeys.googleMapsKey
	};
	const response = await fetch(
		'https://translation.googleapis.com/language/translate/v2?' +
			queryString.stringify(options),
		{
			method: 'POST'
		}
	);
	return await response.json();
}

// getAvailableLanguages
// --------------------------------------------------------------------
// Returns an array of all supported languages, in the following format:
// [
//		{"English": "English", "Native": "English"},
//		{"English": "Danish",  "Native": "Dansk"},
//		{"English": "Arabic",  "Native": "عربى"},
//		...
// ]
export function getAvailableLanguages() {
	if (!global.db.languageOptions || !global.db.language) {
		console.warn(
			'Attempting to get available languages before they are loaded'
		);
		return [];
	} else {
		return Object.keys(global.db.languageOptions).map(function(val) {
			return {
				English: val,
				Native: global.db.language[val][val]
			};
		});
	}
}

// Set the global language setting, store it in AsyncStorage, update the RTL
// setting, and prompt the user to restart if RTL changed.
export function setLanguage(language) {
	Expo.Amplitude.logEventWithProperties('Language Change', {
		from: global.language,
		to: language
	});
	Expo.Amplitude.setUserProperties({ language: language });

	global.language = language;
	AsyncStorage.setItem('language', global.language);

	const shouldBeRTL = global.db.languageOptions[global.language].isRTL;
	I18nManager.forceRTL(shouldBeRTL);
	if (shouldBeRTL !== I18nManager.isRTL) {
		// Wait a bit to display the alert. Showing an alert in the middle of a RTL
		// switch crashes on iOS.
		setTimeout(() => {
			alert(
				translate(
					'Please restart the app to see proper formatting for the language you selected'
				)
			);
		}, 1000);
	}
}
