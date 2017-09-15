import * as Path from "path"
const toposort = require("toposort")

const chunkSorter = {
  dependency(chunks) {
    if (!chunks)
      return chunks

    const edges = []
    const nodeMap = {}

    chunks.forEach(chunk => nodeMap[chunk.id] = chunk)

    chunks.forEach(chunk => {
      if (chunk.parents)
        chunk.parents.forEach(parentId => {
          const parentChunk =
            parentId != null
              && (typeof parentId == "object"
                || typeof parentId == "function")
              ? parentId
              : nodeMap[parentId]

          if (parentChunk)
            edges.push([parentChunk, chunk])
        })
    })

    return toposort.array(chunks, edges)
  },

  id: chunks => chunks.sort((a, b) => a.entry !== b.entry ? b.entry ? 1 : -1 : b.id - a.id),

  none: chunks => chunks,
}

const webpackMajorVer = Number(require("webpack/package.json").version.split(".")[0])
chunkSorter.auto = webpackMajorVer > 1 ? chunkSorter.dependency : chunkSorter.id

function sortChunks(chunks, sortMode = "auto") {
  if (typeof sortMode === "function")
    return chunks.sort(sortMode)

  if (typeof chunkSorter[sortMode] !== "undefined")
    return chunkSorter[sortMode](chunks)

  throw new Error(`${sortMode} is not a valid chunk sort mode`)
}

export default function getWebpackAssets(stats, sortMode) {
  const publicPath = stats.publicPath
  const chunks = sortChunks(stats.chunks, sortMode)

  const assets = {
    // Will contain all js & css files by chunk
    chunks: {},
    // Will contain all js files
    js: [],
    // Will contain all css files
    css: [],
    // Will contain the html5 appcache manifest files if it exists
    manifest: Object.keys(stats.assets).filter(assetFile => Path.extname(assetFile) === ".appcache")[0],
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const chunkName = chunk.names[0]

    assets.chunks[chunkName] = {}

    // Prepend the public path to all chunk files
    const chunkFiles = [].concat(chunk.files).map(chunkFile => publicPath + chunkFile)

    // Webpack outputs an array for each chunk when using sourcemaps
    // But we need only the entry file
    const entry = chunkFiles[0]
    assets.chunks[chunkName].size = chunk.size
    assets.chunks[chunkName].entry = entry
    assets.chunks[chunkName].hash = chunk.hash
    assets.js.push(entry)

    // Gather all css files
    // Some chunks may contain content hash in their names, for ex. 'main.css?1e7cac4e4d8b52fd5ccd2541146ef03f'.
    // We must proper handle such cases, so we use regexp testing here
    const css = chunkFiles.filter(chunkFile => /.css($|\?)/.test(chunkFile))
    assets.chunks[chunkName].css = css
    assets.css = assets.css.concat(css)
  }

  // Duplicate css assets can occur on occasion if more than one chunk
  // requires the same css.
  assets.css = Array.from(new Set(assets.css))

  return assets
}
