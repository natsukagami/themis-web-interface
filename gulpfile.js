const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglifyjs');
const browserify = require('browserify');
const envify = require('envify');
const watchify = require('watchify');
const debug = require('debug')('gulp');

gulp.task('default', ['build-web']);

gulp.task('build-web', ['render-jsx']);

gulp.task('render-jsx', ['render-jsx-index']);

gulp.task('render-jsx-index', () => {
	let b = browserify({
		entries: 'jsx-src/index.jsx',
		debug: true,
		transform: [['babelify', {
			presets: ['react', 'es2015']
		}]]
	})
		.transform(envify, {global: true})
		.bundle()
		.pipe(source('index.js'))
		.pipe(buffer());
	if (process.env.NODE_ENV === 'production')
		b = b.pipe(uglify());
	return b.pipe(gulp.dest('public/js'));
});

gulp.task('watch', () => {
	let a = browserify({
		entries: 'jsx-src/index.jsx',
		debug: true,
		cache: {},
		packageCache: {},
		plugin: [watchify],
		transform: [['babelify', {
			presets: ['react', 'es2015']
		}]]
	});
	a.transform(envify, {global: true});
	a.on('update', () => {
		a.bundle()
		.pipe(source('index.js'))
		.pipe(buffer())
		.pipe(gulp.dest('public/js'));
	});
	a.bundle()
	.pipe(source('index.js'))
	.pipe(buffer())
	.pipe(gulp.dest('public/js'));
	a.on('log', debug);
});
