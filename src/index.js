import * as React from 'react'
import get from 'lodash.get'
import merge from 'lodash.merge'
import isString from 'lodash.isstring'
import kebabCase from 'lodash.kebabcase'
import isNumber from 'lodash.isnumber'
import isPlainObject from 'lodash.isplainobject'
import IntlFormat from 'intl-messageformat'

const DEFAULT_LOCALE = 'de_DE'

const defaultOptions = {
  fallbackToKey: true
}

const localeContext = React.createContext()

function warnAboutMissingTranslation (key) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`@TODO: Key "${key}" was not found. Falling back to the key as translation`)
  }

  return key.split('.').pop()
}

function createUseTranslate (globalTranslations = {}, fallbackLocale = DEFAULT_LOCALE, globalFormats = {}) {
  return function useTranslate (props, options = {}) {
    const { translations, formats = {}, scope } = options

    const locale = React.useContext(localeContext) || fallbackLocale
    const propsTranslations = props.translations || {}
    const mergedFormats = merge({}, globalFormats[locale], formats[locale])

    return React.useCallback(function translate (key, translateOptions) {
      const lookupKey = scope ? `${scope}.${key}` : key

      const options = { ...defaultOptions, ...translateOptions }

      const value = (
        get(propsTranslations[locale], lookupKey) ||
        get(translations[locale], lookupKey) ||
        get(globalTranslations[locale], lookupKey) ||
        (options.fallbackToKey ? warnAboutMissingTranslation(lookupKey) : null)
      )

      // Return the formatted string for numbers and strings
      if (isNumber(value) || isString(value)) {
        return React.useMemo(() => {
          const result = new IntlFormat(value, kebabCase(locale), mergedFormats)
          return result.format({ ...props, ...options })
        }, [value, props])
      }

      // Return another translate function for enum properties
      if (isPlainObject(value)) return subkey => translate(`${key}.${subkey}`, options)

      return value
    }, [propsTranslations, locale, formats])
  }
}

const { Provider: TranslationProvider, Consumer: TranslationConsumer } = localeContext

const useTranslate = createUseTranslate({})

export {
  TranslationProvider,
  TranslationConsumer,
  useTranslate,
  createUseTranslate
}
