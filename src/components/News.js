import {
	StyleSheet,
	View,
	FlatList,
	Text,
	Image,
	TouchableOpacity,
	ActivityIndicator
} from 'react-native';
import React from 'react';
import SpecialCharacter from 'he';
import firebase from 'firebase';

import { translate } from 'venligboerneapp/src/utils/internationalization';
import Colors from 'venligboerneapp/src/styles/Colors.js';
import Moment from 'moment';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles';
import TopBar from './TopBar.js';

export default class News extends React.Component {
	constructor() {
		super();
		this.state = {
			articles: [],
			loading: true
		};
		this.refreshing = false;
	}

	componentDidMount() {
		this.getArticles();
	}

	// TODO this freezes UI and prevents user from leaving
	// Pulls the Article Information From Wordpress
	getArticles = async () => {
		let urls = await firebase
			.database()
			.ref('newsUrls')
			.once('value');
		urls = urls.val();

		let allArticles = await Promise.all(
			urls.map(async page => {
				try {
					let articles = await fetch(page);
					articles = await articles.json();
					articles = articles.posts;
					articles = articles.map(article => {
						let newArticle = {
							key: article.id,
							// content: content,
							title: SpecialCharacter.decode(article.title),
							image: article.thumbnail_images
								? article.thumbnail_images.large
								: null,
							date: Moment(article.date),
							author: article.author.name,
							slug: article.slug
						};
						return newArticle;
					});
					return articles;
				} catch (e) {
					console.warn(e);
					return [];
				}
			})
		);
		//Flatten arrays into one array
		allArticles = [].concat(...allArticles);
		//Sort articles by date
		allArticles = allArticles.sort((a, b) => {
			return b.date.diff(a.date);
		});
		this.setState({
			articles: allArticles,
			loading: false
		});
	};

	_selectArticle = async item => {
		// get article info for each article
		global.setCurrentModal('/SingleNewsArticle', {
			selectedArticle: null,
			disableExit: true
		});
		let url = 'http://www.venligboerne.dk/?json=get_post&slug=' + item.slug;
		let article = await fetch(url);
		article = await article.json();

		//Remove new lines, breaks, and "read more" tags
		let content = article.post.content.replace(/\r?\n|\r/g, '');
		content = content.replace(/<br \/>/g, '');
		content = content.replace(/<p><span id=\"more-[0-9]*\"><\/span><\/p>/g, '');
		item.content = content;
		global.setCurrentModal('/SingleNewsArticle', {
			selectedArticle: item,
			disableExit: false
		});
	};

	//Renders the list of news articles
	_renderArticles = () => (
		<FlatList
			data={this.state.articles}
			ItemSeparatorComponent={() => <View style={SharedStyles.divider} />}
			refreshing={this.refreshing}
			onRefresh={this._onRefresh.bind(this)}
			renderItem={({ item }) => (
				<TouchableOpacity
					onPress={() => this._selectArticle(item)}
					style={styles.articleContainer}
				>
					<View style={styles.articleTitledatecontainer}>
						{/* Date */}
						<Text style={styles.articleDate}>
							{item.date.format('MM·DD·YY')}
						</Text>
						{/* Title */}
						<Text style={styles.articleTitle}>{item.title}</Text>
					</View>
					<View style={{ flexDirection: 'column' }}>
						{/* Image */}
						{item.image ? (
							<Image
								style={styles.articleImage}
								source={{ uri: item.image.url }}
								resizeMode={'cover'}
							/>
						) : (
							<View style={styles.articleImage} />
						)}
						{/* Author */}
						<Text style={styles.articleAuthor}>
							{item.author.toUpperCase()}
						</Text>
					</View>
				</TouchableOpacity>
			)}
		/>
	);

	// Renders animated loading icon when downloading articles
	_loading = () => (
		<View>
			<View style={{ height: '50%' }} />
			<ActivityIndicator animating={true} size={'large'} />
		</View>
	);

	_onRefresh() {
		this.refreshing = true;
		this.getArticles();
		this.refreshing = false;
	}

	render() {
		return (
			<View style={styles.container}>
				<TopBar title={translate('VenligboNews')} />
				{this.state.loading ? this._loading() : this._renderArticles()}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		padding: 0,
		backgroundColor: 'white'
	},
	articleContainer: {
		flex: 1,
		flexDirection: 'row',
		marginHorizontal: 20,
		marginTop: 10
	},
	articleTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		alignSelf: 'flex-start',
		marginVertical: 5
	},
	articleAuthor: {
		fontSize: 14,
		alignSelf: 'flex-start',
		marginVertical: 10,
		color: Colors.grey.dark
	},
	articleImage: {
		flex: 2,
		height: 80,
		marginTop: 10
	},
	articleDate: {
		alignSelf: 'flex-end',
		color: Colors.grey.dark,
		fontWeight: '500'
	},
	articleTitledatecontainer: {
		flexDirection: 'column',
		flex: 3,
		marginRight: 20
	}
});
