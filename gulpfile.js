var gulp = require("gulp"),
	uglify = require("gulp-uglify"),
	sass = require("gulp-sass"),
	newer = require("gulp-newer"),
	gulpif = require("gulp-if"),
	run = require("run-sequence"),
	connect = require("gulp-connect"),
	selectors = require("gulp-selectors"),
	minifyCss = require("gulp-minify-css"),
	es = require("event-stream");

var distDir = "dist/",
	htmlFiles = ["src/index.html", "src/favicon.ico"],
	jsFiles = "src/*.js",
	sassFiles = "src/*.scss";

var vendorFiles = [
		"bower_components/bootstrap/dist/fonts/*"
	],
	vendorStyles = [
		"bower_components/bootstrap/dist/css/bootstrap.min.css"
	];

var isProd = false;

gulp.task("default", ["watch"]);

gulp.task("watch", ["build"], function() {
	gulp.watch(htmlFiles, ["build"]);
	gulp.watch(jsFiles, ["build"]);
	gulp.watch(sassFiles, ["build"]);
});

gulp.task("build", ["vendor"], function() {
	es
		.merge(views(), logic(), styles(), vendor())
		.pipe(selectors.run({
			css: ["scss", "css"],
			html: ["html"]
		}, {
			classes: ["hidden", "hideable"],
			ids: true
		}))
		.pipe(gulp.dest(distDir));
});

gulp.task("build-prod", function(callback) {
	isProd = true;
	run("build", callback);
});

gulp.task("vendor", function() {
	return gulp.src(vendorFiles)
		.pipe(newer(distDir + "vendor"))
		.pipe(gulp.dest(distDir + "vendor"));
});

gulp.task("serve", ["watch"], function() {
	connect.server({
		root: "dist",
		port: 8080
	});
});

function views() {
	return gulp.src(htmlFiles);
}

function logic() {
	return gulp.src(jsFiles)
		.pipe(gulpif(isProd, uglify()));
}

function styles() {
	return gulp.src(sassFiles)
		.pipe(sass())
		.pipe(gulpif(isProd, minifyCss()));
}

function vendor() {
	return gulp.src(vendorStyles)
		.pipe(minifyCss({
			keepSpecialComments: 0
		}));
}