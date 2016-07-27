const NODE_ENV = process.env.NODE_ENV;

// Set up server without minification, allow hot reloading
const isDev = (NODE_ENV === 'development');

// Path variables 
const path = require('path'),
      join = path.join,
      resolve = path.resolve;

const root = resolve(__dirname);
const src = join(root, 'src');
const dest = join(root, 'dist');
const modules = join(root, 'node_modules');

// Require Packages
const webpack = require('webpack');
const fs = require('fs');
const getConfig = require('hjs-webpack');


// 'hjs-webpack' webpack starter tool
// exports a single function that accepts a one argument, an obj
// that defines config to define a required webpack config.
// Usage:
//  in: a single entry file
//  out: path to dir to generate files
var config = getConfig({
    in: join(src, 'app.js'),
    out: dest,
    clearBeforeBuild: true
});

module.exports = config;
