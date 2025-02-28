const browserSync = require('browser-sync').create();

browserSync.init({
  server: {
    baseDir: "./public",
  },
  watch: true,  // Explicitly enable watching files
  files: ["**/*"],
  injectChanges: false,
});