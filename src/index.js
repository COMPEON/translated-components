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

const moneyFormat = locale => ({
  number: {
    money: {
      currency: CURRENCY_BY_REGION[locale.slice(-2)],
      minimumFractionDigits: 0,
      style: 'currency'
    }
  }
})

const createWithTranslation = (globalTranslations = {}, defaultLocale = DEFAULT_LOCALE) => {
  const withTranslation = ({ translations, format = {} }) => {
    const preHeatedTranslations = merge({}, globalTranslations, translations)

    return Component => class WrappedComponent extends React.Component {
      static defaultProps = {
        translations: {}
      }

      getTranslateFunc = (locale = defaultLocale) => {
        const formats = {
          ...moneyFormat(locale),
          ...format
        }

        const translateFunc = memoize(key => {
          const value = (
            get(this.props.translations[locale], key) ||
            get(this.props.translations[defaultLocale], key) ||
            get(preHeatedTranslations[locale], key) ||
            get(preHeatedTranslations[defaultLocale], key)
          )

          // Return the formatted string for numbers and strings
          if (isNumber(value) || isString(value)) {
            const result = new IntlFormat(value, kebabCase(locale), formats)
            return result.format(this.props)
          }

          // Return another translate function for enum properties
          if (isPlainObject(value)) return subkey => translateFunc([key, subkey])

          return value
        })

        return translateFunc
      }

      render () {
        const { translations, ...props } = this.props
        return (
          <TranslationConsumer>
            {locale => <Component translate={this.getTranslateFunc(locale)} {...props} />}
          </TranslationConsumer>
        )
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
