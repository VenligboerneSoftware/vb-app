import { View } from 'react-native';
import React from 'react';

export default class SideMenu extends React.Component {
	render() {
		return (
			<View style={{ flex: 1 }}>
				<View
					style={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: 0,
						right: 0,
						zIndex: 100,
						backgroundColor: 'rgba(0,0,0,0.5)',
						paddingRight: '40%',
						display: this.props.isOpen ? null : 'none'
					}}
				>
					{this.props.menu}
				</View>
				{this.props.children}
			</View>
		);
	}
}
