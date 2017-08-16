import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import Expo from 'expo';
import React from 'react';

import {
	getAvailableLanguages,
	translate,
	setLanguage
} from '../utils/internationalization.js';
import Colors from '../styles/Colors';
import history from '../utils/history.js';

export default class IntroLanguageSelect extends React.Component {
	constructor() {
		super();
		this.state = {
			testLanguages: getAvailableLanguages(),
			currentLanguageIndex: 0
		};

		// Check if we support the system language. If so, use it automatically.
		Expo.Util.getCurrentLocaleAsync().then(locale => {
			locale = locale.split('_')[0]; // Only get the language component
			Object.values(global.db.languageOptions).forEach(async language => {
				if (language.code === locale) {
					console.log('Automatically setting language to', global.language);
					setLanguage(language.name);
					global.language = language.name;
					history.goBack();
				}
			});
		});
	}

	componentDidMount() {
		this.languageRotater = setInterval(() => {
			this.setState({
				currentLanguageIndex: this.state.currentLanguageIndex + 1
			});
		}, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.languageRotater);
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.topBar}>
					<Text style={styles.topBarText}>
						{/* Rotates around available languages */
						translate(
							'Choose a Language',
							this.state.testLanguages[
								this.state.currentLanguageIndex %
									this.state.testLanguages.length
							].English
						)}
					</Text>
				</View>

				<FlatList
					data={this.state.testLanguages}
					keyExtractor={item => item.English}
					renderItem={({ item }) =>
						<TouchableOpacity
							onPressIn={async () => {
								setLanguage(item.English);
							}}
							onPressOut={history.goBack}
							style={styles.buttonContainer}
						>
							<Image
								style={styles.flag}
								source={{ uri: global.db.languageOptions[item.English].flag }}
							/>
							<Text style={styles.language}>
								{item.Native}
							</Text>
						</TouchableOpacity>}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		paddingTop: 20
	},
	topBar: {
		backgroundColor: Colors.blue.dark,
		height: 90,
		width: '100%',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#D9D9D9'
	},
	topBarText: {
		color: 'white',
		textAlign: 'center',
		fontSize: 22,
		fontWeight: '600'
	},
	buttonContainer: {
		flexDirection: 'row',
		width: '60%',
		alignSelf: 'center',
		backgroundColor: Colors.grey.light,
		marginTop: 40
	},
	language: {
		fontSize: 20,
		textAlign: 'center',
		color: Colors.grey.dark,
		flex: 1,
		alignSelf: 'center'
		// fontFamily: 'tigrinya' // TODO this needs to be in the global stylesheet if we want to really support tigrinya
	},
	flag: {
		width: 99,
		height: 66,
		resizeMode: 'cover'
	}
});
