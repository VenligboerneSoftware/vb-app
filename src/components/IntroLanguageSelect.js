import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import React from 'react';

import {
	getAvailableLanguages,
	translate,
	setLanguage
} from '../utils/internationalization.js';
import Colors from '../styles/Colors';

export default class IntroLanguageSelect extends React.Component {
	constructor() {
		super();
		this.state = {
			languages: getAvailableLanguages(),
			currentLanguageIndex: 0
		};
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
							this.state.languages[
								this.state.currentLanguageIndex %
									this.state.languages.length
							].English
						)}
					</Text>
				</View>

				<FlatList
					data={this.state.languages}
					keyExtractor={item => item.English}
					renderItem={({ item }) =>
						<TouchableOpacity
							onPressIn={async () => {
								setLanguage(item.English);
							}}
							onPressOut={() => {
								this.props.location.state.onDone(item.English);
							}}
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
	},
	flag: {
		width: 99,
		height: 66,
		resizeMode: 'cover'
	}
});
