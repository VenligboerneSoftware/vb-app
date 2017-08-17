import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { TouchableOpacity } from 'react-native';
import React from 'react';

import { FontAwesome } from '@expo/vector-icons';
import Colors from 'venligboerneapp/src/styles/Colors.js';

import { getCode } from '../utils/languages.js';
import { translate } from '../utils/internationalization.js';
import APIKeys from '../utils/APIKeys';

export default class SearchLocation extends React.Component {
	render() {
		return (
			// docs: https://www.npmjs.com/package/react-native-google-places-autocomplete
			<GooglePlacesAutocomplete
				placeholder="Search"
				minLength={2} // minimum length of text to search
				autoFocus={true}
				listViewDisplayed="auto" // true/false/undefined
				fetchDetails={true}
				renderDescription={row => row.description} // custom description render
				onPress={this.props.onPress}
				getDefaultValue={() => {
					return ''; // text input default value
				}}
				query={{
					// available options: https://developers.google.com/places/web-service/autocomplete
					key: APIKeys.googleTranslateKey,
					language: getCode(global.language),
					components: 'country:dk'
				}}
				styles={{
					container: {
						flex: 1,
						width: '100%',
						backgroundColor: Colors.white
					},
					textInputContainer: {
						width: '100%',
						justifyContent: 'space-around',
						backgroundColor: Colors.white,
						marginTop: 20,
						marginLeft: 5,
						marginRight: 5
					},
					textInput: {
						width: '100%',
						backgroundColor: '#ddd'
					},
					description: {
						fontWeight: 'bold'
					},
					predefinedPlacesDescription: {
						color: Colors.blue.dark
					}
				}}
				currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
				currentLocationLabel={translate('Current location')}
				nearbyPlacesAPI="None" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
				predefinedPlaces={this.props.predefinedPlaces}
				debounce={100} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
				renderLeftButton={() =>
					<FontAwesome
						name="map-marker"
						size={20}
						style={{
							alignSelf: 'center'
						}}
					/>}
				renderRightButton={() =>
					<TouchableOpacity
						onPress={this.props.hide}
						style={{
							alignSelf: 'center',
							marginRight: 10,
							marginLeft: -5
						}}
					>
						<FontAwesome name="close" size={25} />
					</TouchableOpacity>}
			/>
		);
	}
}