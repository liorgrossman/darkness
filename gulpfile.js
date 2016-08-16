"use strict";

var fs = require('fs');
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var del = require('del');
var zip = require('gulp-zip');

const zipFilename = 'Darkness-CWS-latest.zip';
const chromeDevelopmentDir = 'chrome-extension';
const chromeProductionDir = 'chrome-production';
const chromeZipsDir = 'chrome-zips';
var manifestJson = JSON.parse(fs.readFileSync(chromeDevelopmentDir + '/manifest.json'));

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Preapre a ZIP that is uploaded to Chrome Web Store:
// https://chrome.google.com/webstore/detail/darkness-beautiful-dark-t/imilbobhamcfahccagbncamhpnbkaenm
//----------------------------------------------------------------------------------------------------------------------------------------------------

// Replicate dev to production
gulp.task('cws:replicate', function() {
	gutil.log("Replicate started");
	// Delete any existing production dir
	var deletedFiles = del.sync([chromeProductionDir, zipFilename], {force: true, dryRun: false});
	for (var i in deletedFiles) gutil.log("Deleted: ", deletedFiles[i]);
	// Copy dev dir recursively to production dir
	return gulp.src([chromeDevelopmentDir + '/**/*']).pipe(gulp.dest(chromeProductionDir));
});

// Clean up unnecessary files
gulp.task('cws:cleanup', ['cws:replicate'], function() {
	gutil.log("Cleanup started");
	var deletedFiles = del.sync(
		[chromeProductionDir + '/themes',
		chromeProductionDir + '/style'],
		{force: true, dryRun: false});
	for (var i in deletedFiles) gutil.log("Deleted directory: ", deletedFiles[i]);

	deletedFiles = del.sync(
		[chromeProductionDir + '/**/*.scss',
			chromeProductionDir + '/**/*.map'],
		{force: true, dryRun: false});
	for (var i in deletedFiles) gutil.log("Deleted file: ", deletedFiles[i]);
});

// Zip the production directory
gulp.task('cws:zip', ['cws:cleanup'], function() {
	var archiveFilename = 'Darkness-CWS-v' + manifestJson.version + '_(' + (new Date()).toISOString().slice(0,19).replace('T', '__').replace(/:/g, '-') + ').zip';
	gutil.log("Saving to archive: " + archiveFilename);
	return gulp.src(chromeProductionDir + '/**/*')
		.pipe(zip(zipFilename))
		.pipe(gulp.dest(chromeZipsDir))
		.pipe(zip(archiveFilename))
		.pipe(gulp.dest(chromeZipsDir));
});

gulp.task('cws', ['cws:replicate', 'cws:cleanup', 'cws:zip']);

//----------------------------------------------------------------------------------------------------------------------------------------------------
// SASS compilation
//----------------------------------------------------------------------------------------------------------------------------------------------------

// Clean up all existing (complied) CSS files
gulp.task('sass:cleanup', function() {
	gutil.log("Cleaning up .css and .css.map files");
	var deletedFiles = del.sync([
			chromeDevelopmentDir + '/themes/**/*.css',
			chromeDevelopmentDir + '/themes/**/*.css.map',
			chromeDevelopmentDir + '/themes-css',
			chromeDevelopmentDir + '/style/**/*.css',
			chromeDevelopmentDir + '/style/**/*.css.map',
			chromeDevelopmentDir + '/style-css'
		],
		{force: true, dryRun: false});
	for (var i in deletedFiles) gutil.log("Deleted: ", deletedFiles[i]);
});

// Compile all SCSS files to CSS & map files
gulp.task('sass:compile', function() {
	gulp.src(chromeDevelopmentDir + '/style/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(chromeDevelopmentDir + '/style-css'));

	gulp.src(chromeDevelopmentDir + '/themes/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(chromeDevelopmentDir + '/themes-css'));
});

// Compile all SCSS files to CSS & map files + keep watching them
gulp.task('sass:watch', function() {
	gutil.log("Watching for changes in .scss files");
	gulp.start('sass:compile');
	gulp.watch(chromeDevelopmentDir + '/themes/**/*.scss', ['sass:compile']);
	gulp.watch(chromeDevelopmentDir + '/style/**/*.scss', ['sass:compile']);
});

//----------------------------------------------------------------------------------------------------------------------------------------------------
// Installation
//----------------------------------------------------------------------------------------------------------------------------------------------------

// Compile all SCSS files to CSS & map files + keep watching them
gulp.task('install', function() {
	gulp.start('sass:cleanup');
	gulp.start('sass:compile');
	gutil.log("\nInstallation complete!\n" +
		"You may use the following commands:\n" +
		"$ gulp sass:compile    compile all .scss files to .css and .css.map\n" +
		"$ gulp sass:cleanup    delete all compiled .css and .css.map files\n" +
		"$ gulp sass:watch      watch all .scss files and compile when changed (recommended)\n");
});