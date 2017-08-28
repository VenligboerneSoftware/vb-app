import {
	AsyncStorage,
	Image,
	Platform,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import React from 'react';

import Colors from 'venligboerneapp/src/styles/Colors.js';

import {
	getAvailableLanguages,
	setLanguage
} from '../utils/internationalization.js';
import { translate } from '../utils/internationalization';

export default class LanguageMenu extends React.Component {
	render() {
		return (
			<View style={styles.languageDropdown}>
				{getAvailableLanguages().map(language =>
					<TouchableOpacity
						key={language.English}
						style={styles.languageOption}
						onPress={() => {
							setLanguage(language.English);
							if (this.props.onPress) {
								this.props.onPress(global.language);
							}
							Object.values(global.onLanguageChange).forEach(callback => {
								callback();
							});
						}}
					>
						<Image
							style={styles.flag}
							source={{ uri: global.db.languageOptions[language.English].flag }}
						/>
						<Text
							style={[
								// dynamically style the selected language
								{
									color:
										global.language === language.English
											? Colors.blue.dark
											: Colors.grey.dark
								},
								styles.languageLabel
							]}
						>
							{language.Native}
						</Text>
					</TouchableOpacity>
				)}
				<Switch
					value={global.autotranslate}
					onValueChange={value => {
						console.log('Autotranslate?', value);
						global.autotranslate = value;
						// Empty strings are falsy, and nonempty strings are truey
						AsyncStorage.setItem('autotranslate', value ? 'true' : '');
						Object.values(global.onLanguageChange).forEach(callback => {
							callback();
						});
					}}
				/>
				<Text>
					{translate('Auto Translate')}
				</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	languageDropdown: {
		backgroundColor: Colors.grey.light,
		position: 'absolute',
		top: Platform.OS === 'ios' ? 60 : 35,
		right: 0,
		width: 200,
		borderRadius: 5,
		borderColor: Colors.grey.dark,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'space-around'
	},
	languageOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: 1.5,
		borderColor: Colors.grey.medium,
		width: '90%',
		height: 50
	},
	flag: {
		width: 60,
		height: 40,
		resizeMode: 'cover'
	},
	languageLabel: {
		fontWeight: '600',
		textAlign: 'center',
		width: 100
	}
});
