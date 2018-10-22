const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
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

gulp.task('default', ['build']);

gulp.task('render-ts', () => {
	return gulp
		.src(['./src/**/*.ts', '!./src/frontend/**/*.ts'])
		.pipe(ts())
		.pipe(gulpDebug({ title: 'tsc' }))
		.pipe(gulp.dest('./dist'));
});

gulp.task('render-jsx', () =>
	webpackStream(
		{
			...require('./webpack.config.js'),
			mode: process.env.NODE_ENV || 'production'
		},
		webpack
	)
		.pipe(gulpDebug({ title: 'webpack' }))
		.pipe(gulp.dest('./public/js'))
);

gulp.task('watch', ['render-ts', 'render-jsx'], () => {
	gulp.watch(
		['./src/frontend/**/*.tsx', './src/frontend/**/*.ts'],
		['render-jsx']
	);
	gulp.watch(['./src/**/*.ts', '!./src/frontend/**/*.ts'], ['render-ts']);
});

gulp.task('build', [
	'pre-build',
	'build-copy-files',
	'version-info',
	'yarn-build',
	'clean-yarn-files',
	'zip',
	'post-build'
]);

gulp.task('pre-build', ['verify-npm'], async () => {
	try {
		await promisify(fs.stat)('.build');

		debug('Cleaning up old build');
		return vfs.src('./.build', './.build/**/*').pipe(clean());
	} catch (e) {
		/* Do nothing */
	}
});

gulp.task('build-copy-files', ['pre-build', 'render-ts', 'render-jsx'], () => {
	const merge = require('merge-stream');
	return merge(
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
			.pipe(gulp.dest('./.build')),
		vfs
			.src('./dist/**/*', { base: '.' }) // Actual server source code
			.pipe(gulpDebug())
			.pipe(gulp.dest('./.build')),
		vfs
			.src('./config.sample.js') // Sample config file
			.pipe(require('gulp-rename')('config.js'))
			.pipe(gulpDebug())
			.pipe(gulp.dest('./.build')),
		vfs
			.src('./data/account.sample.xml') // Sample account file
			.pipe(require('gulp-rename')('data/account.xml'))
			.pipe(gulpDebug())
			.pipe(gulp.dest('./.build'))
	);
});

gulp.task('yarn-build', ['build-copy-files'], () => {
	return gulp
		.src(['./.build/package.json'])
		.pipe(gulp.dest('./.build'))
		.pipe(yarn({ production: true }));
});

gulp.task('version-info', ['build-copy-files'], async () => {
	await promisify(fs.writeFile)(
		'./.build/twi.version',
		`v${process.env.npm_package_version}`
	);
});

gulp.task('clean-yarn-files', ['yarn-build'], () => {
	return gulp
		.src(
			[
				'./.build/package.json',
				'./.build/yarn.lock',
				'./.build/gulp_copydeps.js',
				'./.build/.yarnclean'
			],
			{ read: false }
		)
		.pipe(clean());
});

gulp.task('verify-npm', () => {
	if (process.env.npm_package_version === undefined)
		throw new Error('Script must be run from yarn / npm!');
});

gulp.task('zip', ['clean-yarn-files'], () => {
	return gulp
		.src('./.build/**/*')
		.pipe(gulpDebug())
		.pipe(
			require('gulp-zip')(
				`${process.env.npm_package_name}_v${
					process.env.npm_package_version
				}_${require('moment')().format('YYYYMMDD-HHmmss')}.zip`
			)
		)
		.pipe(gulp.dest('./release'));
});

gulp.task('post-build', ['zip'], () => {
	return vfs.src(['./.build'], { read: false }).pipe(clean());
});
