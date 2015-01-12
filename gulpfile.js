var gulp = require("gulp"),
	uglify = require("gulp-uglify"),
	sass = require("gulp-sass"),
	newer = require("gulp-newer"),
	gulpif = require("gulp-if"),
	run = require("run-sequence"),
	connect = require("gulp-connect"),
	selectors = require("gulp-selectors"),
	minifyCss = require("gulp-minify-css"),
	es = require("event-stream"),
	concat = require("gulp-concat");

var distDir = "dist/",
	htmlFiles = [
		"src/*.html",
		"src/favicon.ico"
	],
	indexJsFiles = [
		"src/jsenvy.module.js",
		"src/scope-creep.js",
		"src/libraries.js",
		"src/hideables.js",
		"src/console.js",
		"src/persist.js",
		"src/jsenvy.js",
		"!src/ga.js"
	],
	consoleJsFiles = [
		"src/jsenvy.module.js",
		"src/console.js",
		"src/jsenvy-console.js"
	],
	sassFiles = "src/*.scss";

var fonts = [
		"bower_components/bootstrap/dist/fonts/*"
	],
	vendorStyles = [
		"bower_components/bootstrap/dist/css/bootstrap.min.css"
	];

var isProd = false;

gulp.task("default", ["watch"]);

gulp.task("watch", ["build"], function () {
	gulp.watch(htmlFiles, ["build"]);
	gulp.watch(indexJsFiles, ["build"]);
	gulp.watch(consoleJsFiles, ["build"]);
	gulp.watch(sassFiles, ["build"]);
});

gulp.task("build", ["fonts"], function () {
	es
		.merge(views(), logic(), styles(), vendor())
		.pipe(gulpif(isProd, selectors.run({
			css: ["scss", "css"],
			html: ["html"]
		}, {
			classes: ["hidden", "hideable", "boring-link"],
			ids: true
		})))
		.pipe(gulp.dest(distDir));
});

gulp.task("build-prod", function (callback) {
	isProd = true;
	indexJsFiles.push("src/ga.js");
	consoleJsFiles.push("src/ga.js");
	run("build", callback);
});

gulp.task("fonts", function () {
	return gulp.src(fonts)
		.pipe(newer(distDir + "fonts"))
		.pipe(gulp.dest(distDir + "fonts"));
});

gulp.task("serve", ["watch"], function () {
	connect.server({
		root: "dist",
		port: 8000
	});
});

function views() {
	return gulp.src(htmlFiles);
}

function logic() {
	return es.merge(
		gulp.src(indexJsFiles)
			.pipe(gulpif(isProd, uglify()))
			.pipe(concat("app.js")),
		gulp.src(consoleJsFiles)
			.pipe(gulpif(isProd, uglify()))
			.pipe(concat("app.min.js"))
	);
}

function styles() {
	return gulp.src(sassFiles)
		.pipe(sass())
		.pipe(gulpif(isProd, minifyCss()))
		.pipe(concat("styles.css"));
}

function vendor() {
	return gulp.src(vendorStyles)
		.pipe(minifyCss({
			keepSpecialComments: 0
		}));
}