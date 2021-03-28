'use strict'
module.exports = {
    exit: true,
    bail: true,
    slow: 1000,
    timeout: 100000,
    recursive: true,
    extension: [
        "ts",
        "tsx"
    ],
    global: ['port', 'exp', 'app', 'request'],
    require:["ts-node/register",'test/fixtures.cjs'],
    file: ['test/global.ts']
    // 'watch-files': ['test/**/*.ts']
}
