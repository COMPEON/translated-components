import babel from 'rollup-plugin-babel'
import pkg from './package.json'

const external = Object.keys(pkg.dependencies)

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/translated-components.umd.js',
      name: 'monthpicker',
      format: 'umd'
    },
    {
      file: 'dist/translated-components.es.js',
      name: 'monthpicker',
      format: 'es'
    }
  ],
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      plugins: ['@babel/proposal-class-properties'],
      presets: [['@babel/env', { modules: false }], '@babel/react']
    })
  ],
  external
}
