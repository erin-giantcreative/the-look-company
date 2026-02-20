const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
//const plumber = require('gulp-plumber');

const outDir = './assets/css';

function build(file, outName) {
  return function compile() {
    return src(file)
      //.pipe(plumber())                // keeps the stream alive on errors
      .pipe(sass().on('error', sass.logError))
      .pipe(cleanCSS({ compatibility: 'ie11' }))
      .pipe(rename(outName))
      .pipe(dest(outDir));
  };
}

// individual tasks
const cssMain = build('./assets/scss/main.scss', 'style.min.css');
const cssHome = build('./assets/scss/pages/home.scss', 'home.min.css');
const cssContact = build('./assets/scss/pages/contact.scss', 'contact.min.css');
const cssOurCompanies = build('./assets/scss/pages/our-companies.scss', 'our-companies.min.css');
const cssMeetOurTeam = build('./assets/scss/pages/meet-our-team.scss', 'meet-our-team.min.css');
const cssRetailSolutions = build('./assets/scss/pages/retail-solutions.scss', 'retail-solutions.min.css');
const cssThankYou = build('./assets/scss/pages/thank-you.scss', 'thank-you.min.css');
const cssBlog = build('./assets/scss/pages/blog.scss', 'blog.min.css');

// group task
const styles = parallel(
  cssMain,
  cssHome,
  cssThankYou,
  cssContact,
  cssOurCompanies,
  cssMeetOurTeam,
  cssBlog,
  cssRetailSolutions
);

// watcher
function watcher() {
  watch('./assets/scss/**/*.scss', styles);
}

exports.styles = styles;
exports.default = series(styles, watcher);
