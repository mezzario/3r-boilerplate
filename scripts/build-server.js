/* eslint-disable no-console */

const Chalk = require("chalk")
const Commander = require("commander")

Commander
    .version("0.0.1")
    .description("Build server's implementation into one file using Webpack.")
    .option("-b, --build <type>", "build type (only 'development' or 'production')", /^(development|production)$/)
    .parse(process.argv)

if (!Commander.build || typeof Commander.build !== "string")
    Commander.outputHelp()
else {
    const webpack = require("webpack")
    const webpackConfigFn = require("../webpack.config.js")
    const webpackConfig = webpackConfigFn({ target: "server", build: Commander.build })
    const webpackCompiler = webpack(webpackConfig)

    //WebpackCompiler.watch(undefined, (error, statsData) => {
    webpackCompiler.run((error, statsData) => {
        if (error)
            console.error(Chalk.red(`ERROR:\n${error}\n`))
        else {
            let stats = statsData.toJson()
            //FileSystem.writeFileSync(Path.join(Path.resolve("."), "stats.json"), JSON.stringify(stats, null, "  "), "utf8")

            stats.errors.forEach(s => console.error(Chalk.red(`ERROR:\n${s}\n`)))
            stats.warnings.forEach(s => console.log(Chalk.dim(`WARNING:\n${s}\n`)))

            if (!stats.errors.length)
                console.log(Chalk.green("\nServer has been built successfully.\n"))
        }
    })
}
