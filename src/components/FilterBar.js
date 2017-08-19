import {
	FlatList,
	I18nManager,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import Dates from 'react-native-dates';
import React from 'react';

import { FontAwesome } from '@expo/vector-icons';
import Colors from 'venligboerneapp/src/styles/Colors.js';

import { translate } from '../utils/internationalization';
import FilterListItem from './FilterListItem.js';

export default class FilterBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = props.filter;
	}

	componentWillReceiveProps(props) {
		this.setState(props.filter);
	}

	// Custom setState function to always call the onFilterChange callback
	mySetState = (state, filterRefreshNeeded) => {
		this.setState(state, () => {
			if (filterRefreshNeeded) {
				// Use a setTimeout so the filterchange is registered in a new message,
				// and the UI has time to hide the calendar
				setTimeout(() => {
					this.props.onFilterChange(this.state);
				}, 0);
			}
		});
	};

	// _onIconPressed
	// --------------------------------------------------
	// Stores the selected icon and scrolls down to the rest of the form.
	_onIconPressed = icon => {
		// make a copy to avoid directly modifying state
		let newSelection = this.state.icon.slice();
		const index = newSelection.indexOf(icon);

		if (index === -1) {
			newSelection.push(icon); // If the element doesn't exist, add it
		} else {
			newSelection.splice(index, 1); // If the element exists, remove it
		}

		this.mySetState({ icon: newSelection }, true); //always refresh on icon press
	};

	_onDatesChange = newDates => {
		let filterRefreshNeeded = newDates.startDate && newDates.endDate;
		this.mySetState(
			{
				// store the new data in the state
				// The psuedo-Date object returned aren't fully functional (no toDateLocaleString function).
				// Wrap them in new Dates to get these methods.
				start: new Date(newDates.startDate),
				end:
					newDates.endDate === null
						? this.state.end
						: new Date(newDates.endDate),
				focusedInput:
					newDates.focusedInput === 'endDate' ? 'endDate' : undefined,
				// if the range is picked, hide the picker
				isDatePickerVisible: !(newDates.startDate && newDates.endDate)
			},
			filterRefreshNeeded
		);
	};

	_cancelDate = () => {
		let filterRefreshNeeded = this.state.start && this.state.end;
		this.mySetState(
			{
				start: null,
				end: null,
				focusedInput: null,
				isDatePickerVisible: false
			},
			filterRefreshNeeded
		);
	};

	_renderIcon = ({ item }) => {
		const color =
			this.state.icon.indexOf(item.key) !== -1 && item.key === 'center'
				? Colors.redCenter
				: this.state.icon.indexOf(item.key) !== -1
					? Colors.blue.dark
					: Colors.grey.dark;
		return (
			<FilterListItem
				item={item}
				onPress={this._onIconPressed.bind(this, item.key)}
				color={color}
			/>
		);
	};

	render() {
		return (
			<View style={styles.container}>
				<FlatList
					style={[
						styles.list,
						{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }
					]}
					data={Object.values(global.db.categories).sort(
						(a, b) => a.order - b.order
					)}
					scrollEnabled={true}
					horizontal={true}
					renderItem={this._renderIcon}
				/>

				{this.props.showDatePicker
					? <View style={styles.dateContainer}>
							<TouchableOpacity
								style={[
									{
										backgroundColor:
											this.state.focusedInput === 'startDate'
												? Colors.blue.light
												: Colors.grey.light
									},
									styles.dateBox
								]}
								onPress={() => {
									this.setState({
										focusedInput: 'startDate',
										isDatePickerVisible: true
									});
								}}
							>
								<FontAwesome
									name="calendar"
									size={10}
									style={styles.dateIcon}
								/>
								{this.state.start
									? <Text style={{ width: 40 }}>
											{translate('From')}
										</Text>
									: <Text>
											{translate('Select Dates')}
										</Text>}
								<Text>
									{this.state.start
										? this.state.start.toLocaleDateString('en-GB')
										: ''}
								</Text>
							</TouchableOpacity>
							{this.state.start
								? <TouchableOpacity
										style={[
											{
												backgroundColor:
													this.state.focusedInput === 'endDate'
														? Colors.blue.light
														: Colors.grey.light
											},
											styles.dateBox
										]}
										onPress={() => {
											this.setState({
												focusedInput: 'endDate',
												isDatePickerVisible: true
											});
										}}
									>
										<FontAwesome
											name="calendar"
											size={10}
											style={styles.dateIcon}
										/>
										<Text style={{ width: 40 }}>
											{translate('To')}
										</Text>
										<Text>
											{this.state.end
												? this.state.end.toLocaleDateString('en-GB')
												: ''}
										</Text>
									</TouchableOpacity>
								: null}

							<TouchableOpacity onPress={this._cancelDate}>
								<FontAwesome name="times" size={22} style={styles.cancelDate} />
							</TouchableOpacity>
						</View>
					: null}

				<View
					style={
						// hide instead of unmounting for better performance on show
						this.state.isDatePickerVisible
							? {}
							: {
									display: 'none'
								}
					}
				>
					<Dates
						onDatesChange={this._onDatesChange}
						isDateBlocked={date => {
							return (
								this.state.start !== null &&
								this.state.end === null &&
								date.isBefore(this.state.start, 'day')
							);
						}}
						startDate={this.state.start}
						endDate={this.state.end}
						focusedInput={this.state.focusedInput}
						range
					/>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		flexDirection: 'column',
		backgroundColor: 'white'
	},
	list: {
		borderColor: Colors.grey.light,
		borderBottomWidth: 2
	},
	dateContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		borderColor: Colors.grey.light,
		borderBottomWidth: 2,
		alignItems: 'center'
	},
	dateBox: {
		borderRadius: 5,
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
		height: 25,
		marginLeft: 8,
		marginRight: 8,
		marginTop: 3,
		marginBottom: 3
	},
	dateIcon: {
		margin: 5
	},
	cancelDate: {
		alignSelf: 'center',
		marginRight: 12,
		marginLeft: 5
	}
});
