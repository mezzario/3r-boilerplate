module.exports = {
  getTitle: pageTitle => {
    const mainTitle = "Todo"
    let title = mainTitle
    if (pageTitle)
      title = `${pageTitle} · ${mainTitle}`
    return title
  },

  // set true to render pages on server
  universal: true,

  server: {
    devPort: 3000,
    prodPort: 3005,
  },

  outputStaticFiles: [
    "favicon.ico",
    "robots.txt"
  ],
}
