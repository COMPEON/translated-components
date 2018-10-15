import React from 'react'
import kebabCase from 'lodash.kebabcase'
import transform from 'lodash.transform'
import isString from 'lodash.isstring'
import isNumber from 'lodash.isnumber'
import IntlFormat from 'intl-messageformat'

const DEFAULT_LOCALE = 'de_DE'

const CURRENCY_BY_REGION = {
  AT: 'EUR',
  CH: 'CHF',
  DE: 'EUR',
  FR: 'EUR',
  GB: 'GPB',
  US: 'USD'
}

const passThrough = value => value

const {
  Provider: TranslationProvider,
  Consumer: TranslationConsumer
} = React.createContext(DEFAULT_LOCALE)

const withTranslation = ({ translations, params = {}, mapTranslationsToProps = passThrough, format = {} }) => {
  const initializedTranslations = initializeTranslations(translations, format)

  const wrapComponent = Component => props => {
    const translationsForLocale = locale => translateWithDefaults({
      translations: initializedTranslations,
      locale: locale || DEFAULT_LOCALE,
      reducer: templateReducer(applyParamFunctions(props, params))
    })

    return (
      <TranslationConsumer>
        { locale =>
          <Component
            {...props}
            {...mapTranslationsToProps(translationsForLocale(locale), props)}
          />
        }
      </TranslationConsumer>
    )
  }

  return wrapComponent
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

const applyIntlToTranslations = (translations, locale, format) => (
  transform(translations, (result, entry, key) => {
    result[key] = new IntlFormat(entry, kebabCase(locale), { ...moneyFormat(locale), ...format })
  })
)

const initializeTranslations = (translations, format) => (
  transform(translations, (result, localeTranslations, locale) => {
    result[locale] = applyIntlToTranslations(localeTranslations, locale, format)
  })
)

const templateReducer = (values) => (result, v, k) => {
  result[k] = v.format(values)
  return result
}

const cleanParams = params => (
  transform(params, (result, v, k) => {
    if (isString(v) || isNumber(v)) result[k] = v
  })
)

const applyParamFunctions = (props, params) => (
  transform(params, (result, fn, k) => {
    result[k] = fn(props)
  }, cleanParams(props))
)

const translateWithDefaults = ({ locale, reducer, translations = {} }) => (
  transform({
    ...translations[DEFAULT_LOCALE],
    ...translations[locale]
  }, reducer)
)

export { TranslationProvider, withTranslation }
