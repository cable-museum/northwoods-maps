const browserSync = require('browser-sync').create();

// Initialize BrowserSync and set the base directory (e.g., your 'public' folder)
browserSync.init({
  server: {
    baseDir: './public'  // Adjust this if your HTML files are inside the 'public' folder
  },
  files: ['./public/**/*.{html,css,js}']  // Watch for changes in the 'public' folder and subfolders
});
