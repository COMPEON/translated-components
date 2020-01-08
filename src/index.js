import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/dist/locale-data/de'
import '@formatjs/intl-pluralrules/dist/locale-data/en'
import '@formatjs/intl-pluralrules/dist/locale-data/fr'
import '@formatjs/intl-pluralrules/dist/locale-data/uk'

import React from 'react'
import get from 'lodash.get'
import merge from 'lodash.merge'
import isString from 'lodash.isstring'
import kebabCase from 'lodash.kebabcase'
import isNumber from 'lodash.isnumber'
import memoize from 'lodash.memoize'
import isPlainObject from 'lodash.isplainobject'
import IntlFormat from 'intl-messageformat'

const DEFAULT_LOCALE = 'de_DE'

const defaultOptions = {
  fallbackToKey: true
}

const {
  Provider: TranslationProvider,
  Consumer: TranslationConsumer
} = React.createContext(DEFAULT_LOCALE)

const CURRENCY_BY_REGION = {
  AT: 'EUR',
  CH: 'CHF',
  DE: 'EUR',
  FR: 'EUR',
  GB: 'GPB',
  US: 'USD'
}

const getMoneyFormat = locale => ({
  number: {
    money: {
      currency: CURRENCY_BY_REGION[locale.slice(-2)],
      minimumFractionDigits: 0,
      style: 'currency'
    }
  }
})
const createWithTranslation = (globalTranslations = {}, defaultLocale = DEFAULT_LOCALE, globalFormats = {}) => {
  const withTranslation = ({ translations, formats = {}, scope = null } = {}) => {
    const preHeatedTranslations = merge({}, globalTranslations, translations)

    return Component => {
      const displayName = Component.displayName || Component.name || 'withTranslation(Component)'

      return class WrappedComponent extends React.Component {
        static defaultProps = {
          translations: {}
        }

        warnAboutMissingTranslation = key => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`${displayName}: Key "${key}" was not found. Falling back to the key as translation`)
          }

          return key.split('.').pop()
        }

        getTranslateFunc = memoize((propsTranslations, locale = defaultLocale) => {
          const mergedFormats = merge({}, getMoneyFormat(locale), globalFormats[locale], formats[locale])

          const translateFunc = (key, translateOptions) => {
            const lookupKey = scope ? `${scope}.${key}` : key

            const options = {
              ...defaultOptions,
              ...translateOptions
            }

            const value = (
              get(propsTranslations[locale], lookupKey) ||
              get(preHeatedTranslations[locale], lookupKey) ||
              get(propsTranslations[defaultLocale], lookupKey) ||
              get(preHeatedTranslations[defaultLocale], lookupKey) ||
              (options.fallbackToKey ? this.warnAboutMissingTranslation(lookupKey) : null)
            )

            // Return the formatted string for numbers and strings
            if (isNumber(value) || isString(value)) {
              const result = new IntlFormat(value, kebabCase(locale), mergedFormats)
              return result.format({ ...this.props, ...options })
            }

            // Return another translate function for enum properties
            if (isPlainObject(value)) return subkey => translateFunc(`${key}.${subkey}`, options)

            return value
          }

          return translateFunc
        })

        render () {
          const { translations, ...props } = this.props

          return (
            <TranslationConsumer>
              {locale => (
                <Component translate={this.getTranslateFunc(this.props.translations, locale)} {...props} />
              )}
            </TranslationConsumer>
          )
        }
      }
    }
  }

  return withTranslation
}

const withTranslation = createWithTranslation({})

export {
  TranslationProvider,
  withTranslation,
  createWithTranslation
}
