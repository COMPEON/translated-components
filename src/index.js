import React from 'react'
import get from 'lodash.get'
import merge from 'lodash.merge'
import isString from 'lodash.isString'
import memoize from 'lodash.memoize'
import isPlainObject from 'lodash.isPlainObject'
import isNumber from 'lodash.isNumber'
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

    return Component => class WrappedComponent extends React.Component {
      static defaultProps = {
        translations: {}
      }

      shouldComponentUpdate () {
        return false
      }

      buildTranslations = memoize((locale, translationProps) => merge(
        {},
        globalTranslations[defaultLocale],
        globalTranslations[locale],
        translations[defaultLocale],
        translations[locale],
        translationProps[locale]
      ))

      getTranslateFunc = locale => {
        const formats = {
          ...moneyFormat(locale),
          ...format
        }

        const allTranslations = this.buildTranslations(locale, this.props.translations)

        const translateFunc = memoize(key => {
          const value = get(allTranslations, key)

          // Return the formatted string for numbers and strings
          if (isNumber(value) || isString(value)) {
            const result = new IntlFormat(value, locale, formats)
            return result.format(this.props)
          }

          // Return another translate function for enum properties
          if (isPlainObject(value)) return subkey => translateFunc([key, subkey])

          return value
        })

        return translateFunc
      }

      render () {
        return (
          <TranslationConsumer>
            {locale => <Component translate={this.getTranslateFunc(locale)} {...this.props} />}
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
