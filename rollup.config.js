import { babel } from '@rollup/plugin-babel'
import pkg from './package.json'

const external = [
  ...Object.keys(pkg.dependencies),
  '@babel/runtime/helpers/extends',
  '@babel/runtime/helpers/objectWithoutProperties',
  '@babel/runtime/helpers/classCallCheck',
  '@babel/runtime/helpers/createClass',
  '@babel/runtime/helpers/assertThisInitialized',
  '@babel/runtime/helpers/inherits',
  '@babel/runtime/helpers/possibleConstructorReturn',
  '@babel/runtime/helpers/getPrototypeOf',
  '@babel/runtime/helpers/defineProperty',
  'prop-types'
]

const globals = {
  '@babel/runtime/helpers/extends': '_extends',
  '@babel/runtime/helpers/objectWithoutProperties': '_objectWithoutProperties',
  '@babel/runtime/helpers/classCallCheck': '_classCallCheck',
  '@babel/runtime/helpers/createClass': '_createClass',
  '@babel/runtime/helpers/assertThisInitialized' : '_assertThisInitialized',
  '@babel/runtime/helpers/inherits': '_inherits',
  '@babel/runtime/helpers/possibleConstructorReturn': '_possibleConstructorReturn',
  '@babel/runtime/helpers/getPrototypeOf': '_getPrototypeOf',
  '@babel/runtime/helpers/defineProperty': '_defineProperty',
  react : 'React',
  'prop-types' : 'propTypes',
  'lodash.get': 'get',
  'lodash.merge' : 'merge',
  'lodash.isstring' : 'isString',
  'lodash.kebabcase' : 'kebabCase',
  'lodash.isnumber' : 'isNumber',
  'lodash.memoize' : 'memoize',
  'lodash.isplainobject' : 'isPlainObject',
  'intl-messageformat' : 'IntlFormat',
}

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/translated-components.umd.js',
      name: 'translated-components',
      format: 'umd',
      globals
    },
    {
      file: 'dist/translated-components.es.js',
      name: 'translated-components',
      format: 'es',
      globals
    }
  ],
  plugins: [
    babel({
      babelHelpers: 'runtime',
      babelrc: false,
      exclude: 'node_modules/**',
      plugins: ['@babel/plugin-transform-runtime', '@babel/proposal-class-properties'],
      presets: [['@babel/env', { modules: false }], '@babel/react']
    })
  ],
  external
}
