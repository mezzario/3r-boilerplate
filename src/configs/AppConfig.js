module.exports = {
  getTitle: title => [
    ...Array.isArray(title) ? title : (title ? [title] : []).reverse(),
    "Todo",
  ].join(" · "),

  // set true to render pages on server
  universal: true,

  server: {
    devPort: 3000,
    prodPort: 3005,
  },

  outputStaticFiles: [
    "browserconfig.xml",
    "favicon.ico",
    "manifest.json",
    "robots.txt",
  ],
}
