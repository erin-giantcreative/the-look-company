const { src, dest, watch, series, parallel } = require("gulp");
const sass        = require("gulp-sass")(require("sass"));
const postcss     = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano     = require("cssnano");
const sourcemaps  = require("gulp-sourcemaps");
const rename      = require("gulp-rename");
const terser      = require("gulp-terser");
const concat      = require("gulp-concat");
const imagemin    = require("gulp-imagemin");
const { generate: generateCritical } = require("critical");
const fs        = require("fs");
const postcssLib = require("postcss");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const paths = {
  scss: {
    watch: "./assets/scss/**/*.scss",
  },
  js: {
    src:  "./assets/js/src/**/*.js",
    dest: "./assets/js",
  },
  images: {
    src:  "./assets/images/**/*.{jpg,jpeg,png,gif,svg}",
    dest: "./assets/images",
  },
  css: {
    dest: "./assets/css",
  },
};

// ---------------------------------------------------------------------------
// CSS helpers
// ---------------------------------------------------------------------------

/**
 * Returns a Gulp task that compiles a single SCSS entry point.
 *
 * @param {string}  file    Entry SCSS file path.
 * @param {string}  outName Output filename (e.g. "home.min.css").
 * @param {boolean} isDev   Dev mode: source maps on, no minification.
 */
function buildCSS(file, outName, isDev = false) {
  const plugins = isDev
    ? [autoprefixer()]
    : [autoprefixer(), cssnano()];

  return function compile() {
    let stream = src(file).pipe(sourcemaps.init());

    stream = stream
      .pipe(sass().on("error", sass.logError))
      .pipe(postcss(plugins))
      .pipe(rename(outName));

    if (isDev) {
      stream = stream.pipe(sourcemaps.write("."));
    }

    return stream.pipe(dest(paths.css.dest));
  };
}

// ---------------------------------------------------------------------------
// CSS entry points — build + dev variants
// ---------------------------------------------------------------------------

const cssEntries = [
  ["./assets/scss/main.scss",                   "style.min.css"],
  ["./assets/scss/pages/home.scss",             "home.min.css"],
  ["./assets/scss/pages/thank-you.scss",        "thank-you.min.css"],
  ["./assets/scss/pages/contact.scss",          "contact.min.css"],
  ["./assets/scss/pages/our-companies.scss",    "our-companies.min.css"],
  ["./assets/scss/pages/meet-our-team.scss",    "meet-our-team.min.css"],
  ["./assets/scss/pages/blog.scss",             "blog.min.css"],
  ["./assets/scss/pages/blog-category.scss",    "blog-category.min.css"],
  ["./assets/scss/pages/sports-and-events.scss","sports-and-events.min.css"],
  ["./assets/scss/pages/retail-solutions.scss", "retail-solutions.min.css"],
  ["./assets/scss/pages/faq.scss",              "faq.min.css"],
  ["./assets/scss/pages/our-work.scss",         "our-work.min.css"],
  ["./assets/scss/pages/videos.scss",           "videos.min.css"],
  ["./assets/scss/pages/guides.scss",           "guides.min.css"],
  ["./assets/scss/pages/brand-activations.scss","brand-activations.min.css"],
  ["./assets/scss/pages/the-look-group.scss",   "the-look-group.min.css"],
  ["./assets/scss/pages/careers.scss",          "careers.min.css"],
  ["./assets/scss/pages/lightboxes.scss",       "lightboxes.min.css"],
  ["./assets/scss/pages/fabric-and-frames.scss","fabric-and-frames.min.css"],
  ["./assets/scss/pages/display-systems.scss",  "display-systems.min.css"],
  ["./assets/scss/pages/signs-and-banners.scss","signs-and-banners.min.css"],
  ["./assets/scss/pages/services.scss",         "services.min.css"],
  ["./assets/scss/pages/case-studies.scss",        "case-studies.min.css"],
];

const stylesBuild = parallel(...cssEntries.map(([file, out]) => buildCSS(file, out, false)));
const stylesDev   = parallel(...cssEntries.map(([file, out]) => buildCSS(file, out, true)));

// ---------------------------------------------------------------------------
// JS
// ---------------------------------------------------------------------------

function buildJS(isDev = false) {
  return function scripts() {
    let stream = src(paths.js.src)
      .pipe(concat("forms.js"));

    if (!isDev) {
      stream = stream.pipe(terser());
    }

    return stream.pipe(dest(paths.js.dest));
  };
}

const scriptsBuild = buildJS(false);
const scriptsDev   = buildJS(true);

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

// NOTE: This task only runs if an assets/images/ folder exists.
// Add source images to assets/images/ and run `gulp build` to optimise them.
// Optimised images are written back to the same directory.
function optimizeImages() {
  return src(paths.images.src, { allowEmpty: true })
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 80, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [{ removeViewBox: false }, { cleanupIDs: false }],
      }),
    ]))
    .pipe(dest(paths.images.dest));
}

// ---------------------------------------------------------------------------
// Critical CSS — TODO
// ---------------------------------------------------------------------------
//
// Critical CSS extraction requires a running local server.
// To enable it:
//   1. npm install --save-dev critical
//   2. Set SITE_URL below to your local dev URL.
//   3. Uncomment the task and add it to the `build` export.
//
// const { stream: critical } = require("critical");
// const SITE_URL = "https://the-look-company.local";
//
// function criticalCSS() {
//   return src("path/to/template.html")
//     .pipe(critical({ base: "./", inline: true, css: ["./assets/css/style.min.css"] }))
//     .pipe(dest("./assets/css/critical"));
// }

// ---------------------------------------------------------------------------
// Critical CSS
// ---------------------------------------------------------------------------

// Run manually after `gulp build`: gulp critical
// Requires the local dev site to be running at SITE_URL.
const SITE_URL = "https://tlc.giantcreative.local";

// All pages to extract critical CSS from.
// Critical CSS is merged and deduplicated into a single critical.min.css.
const CRITICAL_PAGES = [
  "/",
  "/contact",
  "/our-companies",
  "/retail-solutions",
  "/sports-and-events",
  "/meet-our-team",
  "/faq",
  "/videos",
  "/guides",
  "/our-work",
  "/brand-activations",
  "/the-look-group",
  "/careers",
  "/lightboxes",
  "/fabric-and-frames",
  "/display-systems",
  "/signs-and-banners",
  "/services",
  "/thank-you",
];

const CRITICAL_OPTIONS = {
  css:    [ "assets/css/style.min.css" ],
  dimensions: [
    { width: 375,  height: 812 },  // mobile
    { width: 768,  height: 1024 }, // tablet
    { width: 1440, height: 900 },  // desktop
  ],
  inline: false,
  ignore: { atrule: [ "@font-face" ] },
  request: { https: { rejectUnauthorized: false } },
  penthouse: {
    chromiumFlags: [ "--ignore-certificate-errors" ],
    chromePath: "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  },
};

async function critical() {
  const chunks = [];

  for (const page of CRITICAL_PAGES) {
    console.log(`  → Extracting critical CSS: ${page}`);
    const { css } = await generateCritical({ ...CRITICAL_OPTIONS, src: SITE_URL + page });
    chunks.push(css);
  }

  // Merge all collected CSS and deduplicate/minify via cssnano.
  const merged   = chunks.join("\n");
  const result   = await postcssLib([ cssnano() ]).process(merged, { from: undefined });

  fs.writeFileSync("assets/css/critical.min.css", result.css);
  console.log(`  ✓ critical.min.css written (${(result.css.length / 1024).toFixed(1)} KB)`);
}

// ---------------------------------------------------------------------------
// Watcher
// ---------------------------------------------------------------------------

function watcher() {
  watch(paths.scss.watch, stylesDev);
  watch(paths.js.src,     scriptsDev);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

exports.styles   = stylesBuild;
exports.scripts  = scriptsBuild;
exports.images   = optimizeImages;
exports.critical = critical;

// gulp dev  — source maps, no minification, then watch
exports.dev = series(parallel(stylesDev, scriptsDev), watcher);

// gulp build — full production pipeline
exports.build = parallel(stylesBuild, scriptsBuild, optimizeImages);

// default: production build + watch (matches previous behaviour)
exports.default = series(exports.build, watcher);
