const pug = require('pug');
const fs = require('fs');
var path = require('path');
const webpack = require("webpack");

try {
    fs.mkdirSync(path.join(__dirname, 'dist'));

    fs.mkdirSync(path.join(__dirname, 'dist/html'), (err) => {
        if (err) console.log(err);
    });

    fs.mkdirSync(path.join(__dirname, 'dist/js'), (err) => {
        if (err) console.log(err);
    });
} catch (e) { }

// fs.mkdir(path.join(__dirname, 'dist/css'), (err) => {
//     if (err) return console.error(err);
// });

const compiledFunction = pug.compileFile('pug/index.pug');
webpack({
    entry: [
        './src/view.js',
        './src/events.js',
        './src/controller.js',
    ],
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'memorybook.min.js',
    },
    mode: 'production',
    optimization: {
        usedExports: false,
    },
}, (err, stats) => {
    if (err || stats.hasErrors()) {
        // Handle errors here
    }
    // Done processing
});

fs.writeFileSync("./dist/html/index.html", compiledFunction(), function (err) {
    if (err) console.log("index.html compile failed")
});

fs.copyFileSync(__dirname + "/node_modules/croppie/croppie.min.js", __dirname + "/dist/js/croppie.min.js");


// fs.copyFile(__dirname + "/node_modules/croppie/croppie.css", __dirname + "/dist/css/croppie.css", (err) => {
//     if (err) console.log("Croppie install failed")
// });

// fs.copyFile(__dirname + "/css/moodyblues.css", __dirname + "/dist/css/moodyblues.css", (err) => {
//     if (err) console.log("Croppie install failed")
// });
