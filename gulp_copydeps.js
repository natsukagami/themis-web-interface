const gulp = require('gulp');
const debug = require('debug')('gulp');

gulp.task('copy-deps', () => {
	if (process.env.NODE_ENV === 'production') {
		debug('In production, nothing to do');
		return;
	}
	const vfs = require('vinyl-fs');
	const merge = require('merge-stream');
	return merge(
		vfs
			.src('./node_modules/bootstrap/dist/css/**/*.min.css')
			.pipe(gulp.dest('./public/css/bootstrap')),
		vfs
			.src('./node_modules/bootstrap/dist/fonts/**/*')
			.pipe(gulp.dest('./public/css/fonts')),
		vfs
			.src('./node_modules/bootstrap/dist/js/**/*.min.js')
			.pipe(gulp.dest('./public/js/bootstrap')),
		vfs
			.src('./node_modules/jquery/dist/**/*.min.js')
			.pipe(gulp.dest('./public/js/jquery')),
		vfs
			.src('./node_modules/cldr-data/main/en/numbers.json')
			.pipe(gulp.dest('./cldr-data/main/en')),
		vfs
			.src('./node_modules/cldr-data/main/vi/numbers.json')
			.pipe(gulp.dest('./cldr-data/main/vi')),
		vfs
			.src('./node_modules/cldr-data/supplemental/numberingSystems.json')
			.pipe(gulp.dest('./cldr-data/supplemental')),
		vfs
			.src('./node_modules/cldr-data/supplemental/likelySubtags.json')
			.pipe(gulp.dest('./cldr-data/supplemental'))
	);
});
