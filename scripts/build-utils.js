"use strict";

const FileSystem = require("fs");
const TypeScript = require("ntypescript");

module.exports.transpileTsFile = (srcPath, destPath) => {
    let textTs = FileSystem.readFileSync(srcPath, "utf8");

    let textJs = TypeScript.transpile(textTs, {
        jsx: TypeScript.JsxEmit.React,
        module: TypeScript.ModuleKind.CommonJS,
        target: TypeScript.ScriptTarget.ES5
    });

    textJs = `(function() {
        var e = {};
        (function(exports) {
            ${textJs}
        })(e);
        return e;
    })()`;

    if (destPath !== undefined)
        FileSystem.writeFileSync(destPath, textJs, "utf8");

    return textJs;
}
