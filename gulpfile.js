const { series, parallel, watch, src, dest } = require('gulp');
const debug = require('debug')('gulp');
const gulpDebug = require('gulp-debug');
const vfs = require('vinyl-fs');
const yarn = require('gulp-yarn');
const clean = require('gulp-clean');
const ts = require('gulp-typescript').createProject('tsconfig.node.json');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const fs = require('fs');
const promisify = require('util').promisify;
const merge = require('merge-stream');

const render_ts = () => {
	return src(['./src/**/*.ts', '!./src/frontend/**/*.ts'])
		.pipe(ts())
		.pipe(gulpDebug({ title: 'tsc' }))
		.pipe(dest('./dist'));
};
exports.render_ts = render_ts;

const render_tsx = () =>
	webpackStream(
		{
			...require('./webpack.config.js'),
			mode: process.env.NODE_ENV || 'production'
		},
		webpack
	)
		.pipe(gulpDebug({ title: 'webpack' }))
		.pipe(dest('./public/js'));
exports.render_tsx = render_tsx;

exports.default = parallel(render_ts, render_tsx);

exports.watch = () => {
	watch(
		['./src/frontend/**/*.tsx', './src/frontend/**/*.ts'],
		{ ignoreInitial: false },
		render_tsx
	);
	watch(
		['./src/**/*.ts', '!./src/frontend/**/*.ts'],
		{ ignoreInitial: false },
		render_ts
	);
};

const verify_npm = async () => {
	if (process.env.npm_package_version === undefined)
		throw new Error('Script must be run from yarn / npm!');
};

const clean_build = async () => {
	try {
		await promisify(fs.stat)('.build');

		debug('Cleaning up .build');
		return vfs.src('./.build', './.build/**/*').pipe(clean());
	} catch (e) {
		/* Do nothing */
	}
};

const build_copy_files = () =>
	merge(
		vfs
			.src(
				[
					'./bin/*', // The node.js binary
					'./cldr-data/**/*',
					'./data/files/readme.md', // Uploadable files folder
					'./data/submit/readme.md', // Submitted solutions folder
					'./public/**/*', // All public files
					'!./public/js/*.map', // ... except .js.map files
					'./views/**/*', // View templates
					'./gulp_copydeps.js', // Copy dependencies
					'./yarn.lock',
					'./.yarnclean',
					'./LICENSE',
					'./package.json',
					'./README.md',
					'./run.bat'
				],
				{ base: '.' }
			)
			.pipe(gulpDebug())
			.pipe(dest('./.build')),
		vfs
			.src('./dist/**/*', { base: '.' }) // Actual server source code
			.pipe(gulpDebug())
			.pipe(dest('./.build')),
		vfs
			.src('./config.sample.js') // Sample config file
			.pipe(require('gulp-rename')('config.js'))
			.pipe(gulpDebug())
			.pipe(dest('./.build')),
		vfs
			.src('./data/account.sample.xml') // Sample account file
			.pipe(require('gulp-rename')('data/account.xml'))
			.pipe(gulpDebug())
			.pipe(dest('./.build'))
	);

const yarn_build = () =>
	src(['./.build/package.json'])
		.pipe(dest('./.build'))
		.pipe(yarn({ production: true }));

const version_info = async () =>
	promisify(fs.writeFile)(
		'./.build/twi.version',
		`v${process.env.npm_package_version}`
	);

const clean_yarn_files = () =>
	src(
		[
			'./.build/package.json',
			'./.build/yarn.lock',
			'./.build/gulp_copydeps.js',
			'./.build/.yarnclean'
		],
		{ read: false }
	).pipe(clean());

const zip = () =>
	src('./.build/**/*')
		.pipe(gulpDebug())
		.pipe(
			require('gulp-zip')(
				`${process.env.npm_package_name}_v${
					process.env.npm_package_version
				}_${require('moment')().format('YYYYMMDD-HHmmss')}.zip`
			)
		)
		.pipe(dest('./release'));

exports.build = series(
	verify_npm,
	clean_build,
	parallel(render_ts, render_tsx),
	build_copy_files,
	parallel(version_info, yarn_build),
	clean_yarn_files,
	zip,
	clean_build
);
