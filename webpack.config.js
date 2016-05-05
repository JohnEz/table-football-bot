const path = require('path');

module.exports = {
	cache: true,
  devtool: 'inline-source-map',
  progress: true,

	entry: './src/main.js',

	output: {
		path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
	},

	module: {
		loaders: [
      {
				test: /\.js$/,
				loader: 'babel-loader',
				include: path.join(__dirname, 'src'),
				query: {presets: ['es2015', 'react'] }
			}
		]
	}
};
