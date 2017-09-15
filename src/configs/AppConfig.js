export default {
  // set true to render pages on server
  universal: true,

  server: {
    devPort: 3000,
    prodPort: 3005,
  },

  // files that should go to build folder and are not handled by webpack
  outputStaticFiles: [
    "content/favicons/apple-touch-icon.png",
    "content/favicons/android-chrome-512x512.png",
    "content/favicons/favicon-16x16.png",
    "content/favicons/favicon-32x32.png",
    "content/favicons/android-chrome-192x192.png",
    "content/favicons/mstile-150x150.png",

    "browserconfig.xml",
    "manifest.json",
    "robots.txt",
  ],
}
