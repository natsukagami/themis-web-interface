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
		vfs.src('./node_modules/bootstrap/dist/css/**/*.min.*').pipe(gulp.dest('./public/css/bootstrap')),
		vfs.src('./node_modules/bootstrap/dist/fonts/**/*').pipe(gulp.dest('./public/css/fonts')),
		vfs.src('./node_modules/bootstrap/dist/js/**/*.min.*').pipe(gulp.dest('./public/js/bootstrap')),
		vfs.src('./node_modules/jquery/dist/**/*.min.*').pipe(gulp.dest('./public/js/jquery'))
	);
}); 