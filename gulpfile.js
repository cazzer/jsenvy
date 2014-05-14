var gulp = require("gulp"),
	uglify = require("gulp-uglify"),
	sass = require("gulp-sass"),
	newer = require("gulp-newer"),
	gulpif = require("gulp-if"),
	run = require("run-sequence");

var distDir = "dist/",
	htmlFiles = "src/index.html",
	jsFiles = "src/jsenvy.js",
	sassFiles = "src/jsenvy.scss";

var vendorFiles = [
	"bower_components/bootstrap/dist/css/bootstrap.min.css",
	"bower_components/bootstrap/dist/fonts/*"
];

var isProd = false;

gulp.task("default", ["watch"]);

gulp.task("watch", ["build"], function () {
	gulp.watch(htmlFiles, ["html"]);
	gulp.watch(jsFiles, ["js"]);
	gulp.watch(sassFiles, ["sass"]);
});

gulp.task("build", ["html", "js", "sass", "vendor"]);

gulp.task("build-prod", function (callback) {
	isProd = true;
	run("build", callback);
});

gulp.task("html", function () {
	return gulp.src(htmlFiles)
		.pipe(gulp.dest(distDir));
});

gulp.task("js", function () {
	return gulp.src(jsFiles)
		.pipe(gulpif(isProd, uglify()))
		.pipe(gulp.dest(distDir));
});

gulp.task("sass", function () {
	return gulp.src(sassFiles)
		.pipe(sass())
		.pipe(gulp.dest(distDir));
});

gulp.task("vendor", function () {
	return gulp.src(vendorFiles)
		.pipe(newer(distDir + "vendor"))
		.pipe(gulp.dest(distDir + "vendor"));
});