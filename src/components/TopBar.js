import {
	I18nManager,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';

import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { translate } from 'venligboerneapp/src/utils/internationalization.js';
import Colors from 'venligboerneapp/src/styles/Colors.js';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles.js';

import LanguageMenu from './LanguageMenu.js';
import Menu from './Menu';
import SearchLocation from './SearchLocation.js';

export default class TopBar extends React.Component {
	static defaultProps = { search: false };

	constructor(props) {
		super(props);

		this.state = {
			languageModalVisible: false,
			searchModalVisible: false,
			isOpen: false
		};
	}

	_showMenu = () => this.setState({ isOpen: true });

	_hideMenu = () => this.setState({ isOpen: false });

	// function: returnTopBar
	// ----------------------------------------
	// returns the icons for the side menu and the language modal
	// as well as the title or search bar depending on this.props.search
	// (defaults to showing title)

	returnTopBar = () => {
		return (
			<View style={styles.container}>
				<TouchableOpacity onPress={this._showMenu}>
					<Ionicons name={'ios-menu'} size={38} style={styles.settings} />
				</TouchableOpacity>

				{this.props.search
					? <TouchableOpacity
							style={styles.searchBar}
							onPress={() => {
								this.setState({ searchModalVisible: true });
							}}
						>
							<FontAwesome
								name={'map-marker'}
								size={22}
								style={styles.pinIcon}
							/>
							<Text>
								{translate('Search Location')}
							</Text>
						</TouchableOpacity>
					: <Text style={styles.titleText}>
							{this.props.title}
						</Text>}

				<TouchableOpacity
					onPress={() => {
						this.setState({ languageModalVisible: true });
					}}
				>
					<Image
						style={styles.flag}
						source={{ uri: global.db.languageOptions[global.language].flag }}
					/>
				</TouchableOpacity>
			</View>
		);
	};

	// function: returnLanguageModal
	// ----------------------------------------
	// Returns the language modal that appears when the
	// language flag icon has been pressed

	returnLanguageModal = () => {
		return (
			<Modal
				visible={this.state.languageModalVisible}
				style={SharedStyles.fullscreen}
			>
				<TouchableOpacity
					style={SharedStyles.fullscreen}
					onPress={() => {
						// Hide when clicking outside the menu
						this.setState({ languageModalVisible: false });
					}}
					activeOpacity={1}
				>
					<LanguageMenu
						onPress={() => {
							// Hide if the user clicks an option
							this.setState({ languageModalVisible: false });
						}}
					/>
				</TouchableOpacity>
			</Modal>
		);
	};

	// function: returnSearchModal
	// ----------------------------------------
	// Returns the search bar modal that appears
	// when the search bar has been pressed

	returnSearchModal = () => {
		return (
			<Modal
				visible={this.state.searchModalVisible}
				style={SharedStyles.fullscreen}
			>
				<SearchLocation
					onPress={(data, details) => {
						if (this.props.onSelectLocation) {
							// Give a default viewport. Mostly for 'Current location'
							if (!details.geometry.viewport) {
								details.geometry.viewport = {
									northeast: {
										lat: details.geometry.location.lat + 0.2,
										lng: details.geometry.location.lng + 0.2
									},
									southwest: {
										lat: details.geometry.location.lat - 0.2,
										lng: details.geometry.location.lng - 0.2
									}
								};
							}
							this.props.onSelectLocation(data, details);
						}
						this.setState({ searchModalVisible: false });
					}}
					hide={() => {
						this.setState({ searchModalVisible: false });
					}}
					predefinedPlaces={[
						{
							formatted_address: translate('Copenhagen'),
							description: translate('Copenhagen'),
							geometry: {
								location: {
									lat: 55.6761,
									lng: 12.5683
								},
								viewport: {
									northeast: {
										lat: 55.727094,
										lng: 12.734265
									},
									southwest: {
										lat: 55.615441,
										lng: 12.453382
									}
								}
							}
						},
						{
							formatted_address: translate('Aarhus'),
							description: translate('Aarhus'),
							geometry: {
								location: {
									lat: 56.1629,
									lng: 10.2039
								},
								viewport: {
									northeast: {
										lat: 56.237635,
										lng: 10.255438
									},
									southwest: {
										lat: 56.118572,
										lng: 10.108511
									}
								}
							}
						}
					]}
				/>
			</Modal>
		);
	};

	render() {
		return (
			<View>
				<Modal
					isVisible={this.state.isOpen}
					animationIn={I18nManager.isRTL ? 'slideInRight' : 'slideInLeft'}
					animationOut={I18nManager.isRTL ? 'slideOutRight' : 'slideOutLeft'}
					backdropColor={'black'}
					backdropOpacity={0.5}
					style={{ padding: 0, margin: 0 }}
				>
					<Menu hide={this._hideMenu} />
				</Modal>

				{this.returnTopBar()}

				{this.returnLanguageModal()}

				{this.returnSearchModal()}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		backgroundColor: 'white',
		justifyContent: 'space-around',
		height: 62,
		alignItems: 'center',
		borderBottomWidth: 2,
		borderBottomColor: Colors.grey.light
	},
	settings: {
		color: 'black',
		marginTop: 20,
		marginLeft: 10,
		marginRight: 10,
		flex: 1
	},
	titleText: {
		alignSelf: 'center',
		textAlign: 'center',
		fontSize: 22,
		marginTop: 14,
		color: 'black',
		flex: 1
	},
	flag: {
		marginTop: 20,
		marginLeft: 10,
		marginRight: 10,
		width: 32,
		height: 32,
		borderRadius: 16,
		borderWidth: 1,
		resizeMode: 'cover'
	},
	searchBar: {
		width: 280,
		height: 30,
		marginTop: 20,
		backgroundColor: '#F2F2F2',
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		flex: 1
	},
	pinIcon: {
		marginLeft: 4,
		marginRight: 10
	}
});
