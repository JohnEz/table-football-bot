const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
			},
			{
				test: /\.png$/,
				loader: 'url-loader',
				include: path.resolve(__dirname, 'src/img'),
				query: { mimetype: 'image/png' }
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Scott Logic Table Football Euros',
			videoBackground: 'background.mp4',
			template: 'my-index.ejs'
		}),
		new webpack.ProvidePlugin({
			'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
		}),
		new CopyWebpackPlugin([
			{from: 'src/video', to: 'src/video'}
		])
	]
};

const production = {
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			minimize: true,
			compress: {
				warnings: false
			},
			output: {
				comments: false
			}
		})
	],
};

var config;
switch(process.env.npm_lifecycle_event) {
	case 'build':
	config = merge(common, production);
	break;
	default:
	config = merge(common, {});
}

module.exports = validate(config);
