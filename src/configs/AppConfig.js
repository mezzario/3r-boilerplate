const config = {
  universal: true, // set "true" to render pages on server
  publicSubdir: "public",
  webRoot: "/",

  server: {
    devPort: 3000,
    prodPort: 3005,
  },

  // files that should go to "build" folder (and not handled by Webpack);
  // specify method to return parameters for file text treated as es6 template literal string
  staticFiles: {
    "content/favicons/android-chrome-192x192.png": null,
    "content/favicons/android-chrome-512x512.png": null,
    "content/favicons/apple-touch-icon.png": null,
    "content/favicons/browserconfig.xml": () => ({webRoot: config.webRoot}),
    "content/favicons/favicon-16x16.png": null,
    "content/favicons/favicon-32x32.png": null,
    "content/favicons/favicon.ico": null,
    "content/favicons/manifest.json": () => ({webRoot: config.webRoot}),
    "content/favicons/safari-pinned-tab.svg": null,
    "content/favicons/mstile-150x150.png": null,

    "robots.txt": null,
  },
}

export default config
