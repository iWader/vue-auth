// Borrowed from https://github.com/vuejs/vuex/blob/master/build/build.js

process.env.BABEL_ENV = 'production'

var fs = require('fs'),
    rollup = require('rollup'),
    babel = require('rollup-plugin-babel'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    commonjs = require('rollup-plugin-commonjs'),
    uglify = require('uglify-js'),
    version = process.env.VERSION || require('./package.json').version

var banner =
  '/*!\n' +
  ' * vue-auth v' + version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' Wade Urry\n' +
  ' * Released under the MIT License.\n' +
  ' */'

rollup.rollup({
  entry: 'src/index.js',
  plugins: [
      nodeResolve(),
      commonjs({
        include: 'node_modules/**'
      }),
      babel()
  ]
})

  .then(function(bundle) {
    return write('dist/vue-auth.js', bundle.generate({
      format: 'umd',
      banner: banner,
      moduleName: 'VueAuth'
    }).code)
  })

  .then(function() {
    return rollup.rollup({
      entry: 'src/index.js',
      plugins: [
        nodeResolve(),
        commonjs({
          include: 'node_modules/**'
        }),
        babel()
      ]
    })
  })

  .then(function(bundle) {
    var code = bundle.generate({
      format: 'umd',
      moduleName: 'VueAuth'
    }).code

    var minified = banner + '\n' + uglify.minify(code, {
      fromString: true,
      output: {
        ascii_only: true
      }
    }).code

    return write('dist/vue-auth.min.js', minified)
  })

  .catch(logError)

function write(dest, code) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(dest, code, function(err) {
      if (err) return reject(err)
      console.log(blue(dest) + ' ' + getSize(code));
      resolve();
    })
  })
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError(err) {
  console.log(err)
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
