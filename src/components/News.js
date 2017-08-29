import {
	StyleSheet,
	View,
	FlatList,
	Text,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	RefreshControl
} from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';
import SpecialCharacter from 'he';
import firebase from 'firebase';

import { translate } from 'venligboerneapp/src/utils/internationalization';
import Colors from 'venligboerneapp/src/styles/Colors.js';
import Moment from 'moment';
import SharedStyles from 'venligboerneapp/src/styles/SharedStyles';
import TopBar from './TopBar.js';
import SingleNewsArticle from './SingleNewsArticle.js';

export default class News extends React.Component {
	constructor() {
		super();
		this.state = {
			articles: [],
			articlesLoaded: false,
			selectedArticle: null,
			refreshing: false
		};
		this.getArticles();
	}

	// TODO this freezes UI and prevents user from leaving
	// Pulls the Article Information From Wordpress
	getArticles = async () => {
		let urls = await firebase.database().ref('newsUrls').once('value');
		urls = urls.val();

		let allArticles = await Promise.all(
			urls.map(async page => {
				try {
					let articles = await fetch(page);
					articles = await articles.json();
					articles = articles.posts;
					articles = await Promise.all(
						articles.map(async article => {
							//get article info for each article
							let url =
								'http://www.venligboerne.dk/?json=get_post&slug=' +
								article.slug;
							article = await fetch(url);
							article = await article.json();

							//Remove new lines, breaks, and "read more" tags
							let content = article.post.content.replace(/\r?\n|\r/g, '');
							content = content.replace(/<br \/>/g, '');
							content = content.replace(
								/<p><span id=\"more-[0-9]*\"><\/span><\/p>/g,
								''
							);

							let newArticle = {
								key: article.post.id,
								content: content,
								title: SpecialCharacter.decode(article.post.title),
								thumbnail: article.post.thumbnail_images
									? article.post.thumbnail_images.large
									: null,
								date: Moment(article.post.date),
								author: article.post.author.name
							};
							return newArticle;
						})
					);
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
			articlesLoaded: true
		});
	};

	_selectArticle = item => this.setState({ selectedArticle: item });
	_deselectArticle = () => {
		this.setState({ selectedArticle: null });
	};

	//Renders the list of news articles
	_renderArticles = () =>
		<FlatList
			data={this.state.articles}
			ItemSeparatorComponent={() => <View style={SharedStyles.divider} />}
			refreshControl={
				<RefreshControl
					refreshing={this.state.refreshing}
					onRefresh={this._onRefresh.bind(this)}
				/>
			}
			renderItem={({ item }) =>
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
						<Text style={styles.articleTitle}>
							{item.title}
						</Text>
					</View>
					<View style={{ flexDirection: 'column' }}>
						{/* Image */}
						{item.thumbnail
							? <Image
									style={styles.articleImage}
									source={{ uri: item.thumbnail.url }}
									resizeMode={'cover'}
								/>
							: <View style={styles.articleImage} />}
						{/* Author */}
						<Text style={styles.articleAuthor}>
							{item.author.toUpperCase()}
						</Text>
					</View>
				</TouchableOpacity>}
		/>;

	// Renders animated loading icon when downloading articles
	_loading = () =>
		<View>
			<View style={{ height: '50%' }} />
			<ActivityIndicator animating={true} size={'large'} />
		</View>;

	_onRefresh() {
		this.setState({ refreshing: true });
		this.getArticles();
		this.setState({ refreshing: false });
	}

	render() {
		return (
			<View style={styles.container}>
				<TopBar title={translate('VenligboNews')} />
				{this.state.selectedArticle
					? global.setCurrentModal('/SingleNewsArticle', {
							selectedArticle: this.state.selectedArticle,
							exit: this._deselectArticle
						})
					: null}
				{this.state.articlesLoaded ? this._renderArticles() : this._loading()}
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
		flex: 0.4,
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
		flex: 0.6,
		marginRight: 20
	}
});
