const webpack = require('webpack');

module.exports = {
	entry: {
		index: './src/frontend/index.tsx',
		scoreboard: './src/frontend/scoreboard.tsx'
	},
	output: {
		filename: '[name].js',
		path: process.cwd() + '/public/js'
	},
	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: ['.ts', '.tsx', '.js', '.json', '.css']
	},
	module: {
		rules: [
			{ test: /\.css$/, loader: ['style-loader', 'css-loader'] },
			{ test: /(\.ts|\.tsx)$/, loader: 'awesome-typescript-loader' },
			{ enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' }
		]
	},

	optimization: {
		splitChunks: {
			chunks: 'all'
		}
	},

	devtool: 'source-map',

	plugins: [
		new webpack.DefinePlugin({
			// <-- key to reducing React's size
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new webpack.optimize.AggressiveMergingPlugin() //Merge chunks
	]

	// externals: {
	// 	react: 'React',
	// 	'react-dom': 'ReactDOM'
	// }
};
