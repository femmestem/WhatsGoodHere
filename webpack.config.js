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
const dotenv = require('dotenv');
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

// ==begin ENV variables
const dotEnvVars = dotenv.config();

// use env-specific configs at 'config/[env].config.js'
// to override global env configs at `.env`
const environmentEnv = dotenv.config({
    path: join(root, 'config', `${NODE_ENV}.config.js`),
    silent: true
});
const envVariables = Object.assign({}, dotEnvVars, environmentEnv);

// Create config object for DefinePlugin()
// Stringify env vars to prevent browser JS parser issues
// with unrecognized chars
const defines =
    Object.keys(envVariables)
    .reduce((memo, key) => {
        const val = JSON.stringify(envVariables[key]);
        memo[`__${key.toUpperCase()}__`] = val;
        return memo;
        }, {
            __NODE_ENV__: JSON.stringify(NODE_ENV)
        }
    );

config.plugins = [
    new webpack.DefinePlugin(defines)
].concat(config.plugins);
// ==end ENV variables

// ==begin CSS Configs
// Each plugin exported as a function that accepts
// optional configs, returns a postcss processor
config.postcss = [].concat([
    require('precss')({/* options */}),
    require('autoprefixer')({/* options */}),
    require('cssnano')({/* options */})
]);

// CSS Modules
const cssModulesNames = `${ isDev ? '[path][name]__[local]__' : "" }[hash:base64:5]`;
const matchCssLoaders = /(^|!)(css-loader)($|!)/;

const findLoader = (loaders, match) => {
    const found = loaders.filter( l => l && l.loader && l.loader.match(match));
    if (found) {
        return found[0];
    } else {
        return null;
    }
}
// Existing CSS loader to be modified
const cssLoader = findLoader(config.module.loaders, matchCssLoaders);

// Clone CSS loader and modify it to only include CSS files in the source dir
const newLoader = Object.assign(
    {},
    cssLoader,
    {
        test: /\.module\.css$/,
        include: [src],
        loader: cssLoader.loader.replace(
            matchCssLoaders,
            `$1$2?modules&localIdentName=${cssModulesNames}$3`
            )
    }
);

// Add modified loader to modules to be bundled
config.module.loaders.push(newLoader);

// for CSS stylesheets not in souce dir, load without modules support
cssLoader.test = new RegExp(`[^module]${cssLoader.test.source}`);
cssLoader.loader = newLoader.loader
config.module.loaders.push({
    test: /\.css$/,
    include: [modules],
    loader: 'style!css'
});
// ==end CSS Configs

// ==begin Require Files Relative to Source
config.resolve.root = [src, modules]
config.resolve.alias = {
  'css': join(src, 'styles'),
  'containers': join(src, 'containers'),
  'components': join(src, 'components'),
  'utils': join(src, 'utils'),
  'styles': join(src, 'styles')
}
// ==end Require Files Relative to Source

module.exports = config;
