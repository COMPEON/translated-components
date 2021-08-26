import { babel } from '@rollup/plugin-babel'
import pkg from './package.json'

const external = Object.keys(pkg.dependencies)

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/translated-components.umd.js',
      name: 'translated-components',
      format: 'umd'
    },
    {
      file: 'dist/translated-components.es.js',
      name: 'translated-components',
      format: 'es'
    }
  ],
  plugins: [
    babel({
      babelHelpers: 'runtime',
      babelrc: false,
      exclude: 'node_modules/**',
      plugins: ['@babel/plugin-transform-runtime', '@babel/proposal-class-properties'],
      presets: [['@babel/preset-env', { modules: false }], '@babel/preset-react']
    })
  ],
  external
}
