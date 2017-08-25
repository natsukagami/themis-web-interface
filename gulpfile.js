const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const envify = require('envify');
const watchify = require('watchify');
const debug = require('debug')('gulp');
const gulpDebug = require('gulp-debug');
const vfs = require('vinyl-fs');
const yarn = require('gulp-yarn');
const clean = require('gulp-clean');

gulp.task('default', ['build']);

gulp.task('render-jsx', ['render-jsx-index', 'render-jsx-scoreboard']);

function jsxRender(entry, filename) {
	let b = browserify({
		entries: entry,
		debug: false
	})
		.transform('babelify', {
			presets: ['env', 'react']
		})
		.transform(envify, { global: true })
		.bundle()
		.pipe(source(filename))
		.pipe(buffer());
	if (process.env.NODE_ENV === 'production')
		b = b.pipe(uglify());
	return b.pipe(gulp.dest('public/js')).pipe(require('gulp-gzip')({ level: 9 })).pipe(gulp.dest('public/js'));
}

gulp.task('render-jsx-index', () => {
	return jsxRender('jsx-src/index.jsx', 'index.js');
});

gulp.task('render-jsx-scoreboard', () => {
	return jsxRender('jsx-src/scoreboard.jsx', 'scoreboard.js');
});

function jsxWatch(entry, filename) {
	let a = browserify({
		entries: entry,
		debug: true,
		cache: {},
		packageCache: {},
		plugin: [watchify],
		transform: [['babelify', {
			presets: ['react', 'env']
		}]]
	});
	a.transform(envify, {global: true});
	a.on('update', () => {
		a.bundle()
		.pipe(source(filename))
		.pipe(buffer())
		.pipe(gulp.dest('public/js'));
	});
	a.bundle()
	.pipe(source(filename))
	.pipe(buffer())
	.pipe(gulp.dest('public/js'));
	a.on('log', debug);
}

gulp.task('watch', () => {
	jsxWatch('jsx-src/index.jsx', 'index.js');
	jsxWatch('jsx-src/scoreboard.jsx', 'scoreboard.js');
});

gulp.task('build', ['pre-build', 'build-copy-files', 'version-info', 'yarn-build', 'clean-yarn-files', 'zip', 'post-build']);

gulp.task('pre-build', ['verify-npm'], done => {
	require('fs').stat('.build', err => {
		if (err) return done();
		debug('Cleaning up old build');
		vfs.src('./.build', './.build/**/*').pipe(clean()).on('end', done);
	});
});

gulp.task('build-copy-files', ['pre-build', 'render-jsx'], () => {
	const merge = require('merge-stream');
	return merge(
		vfs.src([
			'./**/*',
			'!./dist',
			'!./dist/**/*',
			'!./jsx-src',
			'!./jsx-src/**/*',
			'!./node_modules',
			'!./node_modules/**/*',
			'!./.*',
			'!./.*/**/*',
			'!./gulpfile.js',
			'!./config.sample.js',
			'!./config.js',
			'!./data/submit/*',
			'./data/submit/readme.md',
			'!./data/submit/logs/*',
			'!./data/files/*',
			'!./data/account.xml',
			'!./data/account.sample.xml',
			'./data/files/readme.md',
			'!./tests/**/*',
			'!./public/js/*.js'
		], { follow: true }).pipe(gulpDebug()).pipe(gulp.dest('./.build')),
		vfs.src('./config.sample.js')
			.pipe(require('gulp-rename')('config.js'))
			.pipe(gulpDebug())
			.pipe(gulp.dest('./.build')),
		vfs.src('./data/account.sample.xml')
			.pipe(require('gulp-rename')('data/account.xml'))
			.pipe(gulpDebug())
			.pipe(gulp.dest('./.build'))
	);
});

gulp.task('yarn-build', ['build-copy-files'], () => {
	return gulp.src(['./.build/package.json'])
	.pipe(gulp.dest('./.build'))
	.pipe(yarn({ production: true }));
});

gulp.task('version-info', ['build-copy-files'], () => {
	require('fs').writeFileSync('./.build/twi.version', `v${process.env.npm_package_version}`);
	return;
});

gulp.task('clean-yarn-files', ['yarn-build'], () => {
	return gulp.src(['./.build/package.json', './.build/yarn.lock', './.build/gulp_copydeps.js'], { read: false })
	.pipe(clean());
});

gulp.task('verify-npm', () => {
	if (process.env.npm_package_version === undefined)
		throw new Error('Script must be run from yarn / npm!');
});

gulp.task('zip', ['clean-yarn-files'], () => {
	return gulp.src('./.build/**/*')
	.pipe(gulpDebug())
	.pipe(require('gulp-zip')(`${process.env.npm_package_name}_v${process.env.npm_package_version}_${require('moment')().format('YYYYMMDD-HHmmss')}.zip`))
	.pipe(gulp.dest('./dist'));
});

gulp.task('post-build', ['zip'], () => {
	return vfs.src(['./.build'], { read: false })
	.pipe(clean());
});
