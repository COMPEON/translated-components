import React from 'react'
import get from 'lodash.get'
import merge from 'lodash.merge'
import isString from 'lodash.isString'
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

      buildTranslations = locale => merge(
        {},
        globalTranslations[locale],
        translations[defaultLocale],
        translations[locale],
        this.props.translations[locale]
      )

      getTranslateFunc = locale => {
        const formats = {
          ...moneyFormat(locale),
          ...format
        }

        const allTranslations = this.buildTranslations(locale)

        return function translate (key) {
          const value = get(allTranslations, key)

          if (isNumber(value) || isString(value)) {
            const result = new IntlFormat(formats, value, locale)
            return result.format(this.props)
          }

          return value
        }
      }

      render () {
        return (
          <TranslationConsumer>
            {locale => <Component translate={this.getTranslateFunc(locale)} />}
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
