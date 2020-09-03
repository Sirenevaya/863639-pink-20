const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const babel = require("gulp-babel");
const terser = require("gulp-terser");

// Clean

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Copy

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
};

exports.copy = copy;

// Imagemin

const images = () => {
  return gulp.src("build/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.svgo()
    ]))
}

exports.images = images;

// Html

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true,
    }))
    .pipe(gulp.dest("build"))
    .pipe(sync.stream());
};

exports.html = html;

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Scripts

const scripts = () => {
  return gulp.src("source/js/*.js")
    .pipe(babel({
      presets: ["@babel/preset-env"]
    }))
    .pipe(terser())
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
};

exports.scripts = scripts;

// Build

const build = gulp.series(clean, copy, html, styles, scripts);

exports.build = build;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/*.html").on("change", gulp.series(html));
  gulp.watch("source/sass/**/*.scss", gulp.series(styles));
}

exports.watcher = watcher;

exports.default = gulp.series(
  server, watcher
);
