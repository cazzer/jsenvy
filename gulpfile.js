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
	concat = require("gulp-concat"),
	minifyHtml = require("gulp-minify-html");

var distDir = "dist/",
	images = [
		"src/favicon.ico",
		"src/*.png"
	],
	htmlFiles = [
		"src/*.html"
	],
	indexJsFiles = [
		"src/jsenvy.module.js",
		"src/scope-creep.js",
		"src/libraries.js",
		"src/hideables.js",
		"src/console.js",
		"src/persist.js",
		"src/load-from-persist.js",
		"src/jsenvy.js"
	],
	consoleJsFiles = [
		"src/jsenvy.module.js",
		"src/libraries.js",
		"src/persist.js",
		"src/console.js",
		"src/load-from-persist.js"
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

gulp.task("build", ["fonts", "images"], function () {
	es
		.merge(views(), logic(), styles(), vendor())
		/*.pipe(gulpif(isProd, selectors.run({
			css: ["scss", "css"],
			html: ["html"]
		}, {
			classes: ["hidden", "hideable", "boring-link"],
			ids: true
		})))*/
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
gulp.task("images", function () {
	return gulp.src(images)
		.pipe(newer(distDir))
		.pipe(gulp.dest(distDir));
});


gulp.task("serve", ["watch"], function () {
	connect.server({
		root: "dist",
		port: 8000
	});
});

function views() {
	return gulp.src(htmlFiles)
		.pipe(gulpif(isProd, minifyHtml()));
}

function logic() {
	return es.merge(
		gulp.src(indexJsFiles)
			.pipe(concat("app.js"))
			.pipe(gulpif(isProd, uglify())),
		gulp.src(consoleJsFiles)
			.pipe(concat("app.min.js"))
			.pipe(gulpif(isProd, uglify()))
	);
}

function styles() {
	return gulp.src(sassFiles)
		.pipe(sass())
		.pipe(concat("styles.css"))
		.pipe(gulpif(isProd, minifyCss()));
}

function vendor() {
	return gulp.src(vendorStyles)
		.pipe(minifyCss({
			keepSpecialComments: 0
		}));
}