const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const webpack = require('webpack');

const PATHS = {
	app: path.join(__dirname, 'src'),
	build: path.join(__dirname, 'build')
};

const common = {
	// cache: true,
	// devtool: 'inline-source-map',
	// progress: true,

	entry: path.join(PATHS.app, 'main.js'),

	output: {
		path: PATHS.build,
		filename: 'bundle.js',
	},

	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: path.join(__dirname, 'src'),
				query: {presets: ['es2015', 'react'] }
			},
			{
				test: /\.scss$/,
				loaders: ['style', 'css', 'sass'],
				include: path.resolve(__dirname, 'src')
			},
			{
				test: /\.jpg$/,
				loader: 'url-loader',
				include: path.resolve(__dirname, 'src/img'),
				query: { mimetype: 'image/jpg' }
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Scott Logic Table Football Euros',
			template: 'my-index.ejs'
		}),
		new webpack.ProvidePlugin({
			'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
		}),
	]
};

var config;
switch(process.env.npm_lifecycle_event) {
	case 'build':
	config = merge(common, {});
	break;
	default:
	config = merge(common, {});
}

module.exports = validate(config);
