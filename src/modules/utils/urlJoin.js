export default function urlJoin(...urls) {
  return urls
    .filter(url => !!url)
    .map((url, i) => {
      if (i !== 0)
        url = url.replace(/^\/+/, "") // remove all leading slashes
      if ((i !== 0 || (url !== "//" && !url.endsWith("://"))) && i !== urls.length - 1)
        url = url.replace(/\/*$/, "/") // replace 0 or more trailing slashes to 1
      return url
    })
    .join("")
}
