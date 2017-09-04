import {
	StyleSheet,
	View,
	Text,
	Image,
	ScrollView,
	ActivityIndicator
} from 'react-native';
import HTMLView from 'react-native-htmlview';
import React from 'react';

import Colors from 'venligboerneapp/src/styles/Colors.js';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles';
import htmlStyles from 'venligboerneapp/src/utils/HTMLStyle.js';

import ExitBar from './ExitBar';

export default class SingleNewsArticle extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={[SharedStyles.modalContent, styles.articleModalContainer]}>
				<ExitBar disableExit={this.props.disableExit} />
				{this.props.selectedArticle ? (
					<ScrollView keyboardShouldPersistTaps={'handled'}>
						{/* Author and Date */}
						<Text style={styles.selectedArticleHeader}>
							{this.props.selectedArticle.author +
								'   ' +
								this.props.selectedArticle.date.format('MM·DD·YY')}
						</Text>
						{/* Title */}
						<Text style={styles.selectedArticleTitle}>
							{this.props.selectedArticle.title}
						</Text>
						{/* Image */}
						{this.props.selectedArticle.image ? (
							<Image
								style={styles.selectedArticleImage}
								source={{ uri: this.props.selectedArticle.image.url }}
								resizeMode={'cover'}
							/>
						) : null}
						<View style={SharedStyles.divider} />
						{/* Content */}
						<View style={styles.selectedArticleContent}>
							<HTMLView
								value={this.props.selectedArticle.content}
								stylesheet={htmlStyles}
							/>
						</View>
					</ScrollView>
				) : (
					<View>
						<ActivityIndicator animating={true} size={'large'} />
						<View style={{ height: '70%' }} />
					</View>
				)}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	articleModalContainer: {
		justifyContent: 'space-between',
		backgroundColor: Colors.white,
		alignItems: 'center'
	},
	selectedArticleContent: {
		margin: 10
	},
	selectedArticleImage: {
		height: 170,
		marginHorizontal: 10,
		marginVertical: 15
	},
	selectedArticleTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		marginTop: 5,
		textAlign: 'center',
		marginBottom: 10,
		marginHorizontal: 10
	},
	selectedArticleHeader: {
		alignSelf: 'center',
		fontSize: 14,
		marginVertical: 10,
		color: Colors.grey.dark
	}
});
