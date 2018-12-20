/* eslint-disable */
import React from 'react'
import { mount } from 'enzyme'
import { TranslationProvider, createWithTranslation } from '../src'

const globalTranslations = {
  de_DE: {
    inquiry: 'Anfrage',
    productKinds: {
      overdraft: 'Überentwurf'
    }
  }
}


const translations = {
  de_DE: {
    title: 'Dies ist ein fester Titel',
    kebabLabel: 'Du, du hast.',
    message: 'Eine Schweinshaxe, bitte.',
    a: {
      deeply: {
        nested: {
          maschmüller: 'karl'
        }
      }
    }
  },
  de_AT: {
    title: 'Dies ist ein {customTitle}',
    x: {
      title: '123'
    },
    kebabLabel: 'Du hast {amount, number, money}!',
    message: 'Hier wird nie etwas anderes stehen.'
  },
  de_CH: {
    kebabLabel: 'Du hast {amount, number, money}!'
  },
  en_GB: {
    title: 'Good day, Sir.'
  },
  en_US: {
    message: 'Let\'s eat {numBurgers, plural, =0 {no burgers} =1 {one burger} other {# burgers}} today.'
  },
  fr_FR: {
    kebabLabel: 'Dat macht {amount, number, mark}',
    title: 'This is going to be {interpolated}'
  }
}

describe('Translate components', () => {
  const withTranslation = createWithTranslation(globalTranslations)

  const subject = (Component, { locale, scope, formats, ...rest }) => {
    const WrappedComponent = withTranslation({ translations, scope, formats })(Component)

    return mount(
      <TranslationProvider value={locale}>
        <WrappedComponent {...rest} />
      </TranslationProvider>
    )
  }

  it('does not touch non-translation props', () => {
    const Component = ({ notToBeTranslated }) => <span>{notToBeTranslated}</span>
    expect(subject(Component, { locale: 'de_DE', notToBeTranslated: 99 })).toMatchSnapshot()
  })

  it('translates values using the locale', () => {
    const Component = ({ translate }) => <span>{translate('title')}</span>
    expect(subject(Component, { locale: 'en_GB' })).toMatchSnapshot()
  })

  it('uses a translation from the translation props', () => {
    const Component = ({ translate }) => <span>{translate('title')}</span>
    expect(subject(Component, {
      locale: 'en_GB',
      translations: { en_GB: { title: 'Proper title' } }
    })).toMatchSnapshot()
  })

  it('falls back to the global translations', () => {
    const Component = ({ translate }) => <span>{translate('inquiry')}</span>
    expect(subject(Component, { locale: 'de_DE' })).toMatchSnapshot()
  })

  it('uses the key when no translation is found and warns about it', () => {
    const Component = ({ translate }) => <span>{translate('carsten.kurt.maschmüller')}</span>
    const warn = jest.spyOn(global.console, 'warn')

    expect(subject(Component, { locale: 'de_DE' })).toMatchSnapshot()
    expect(warn).toHaveBeenCalledWith(
      'Component: Key "carsten.kurt.maschmüller" was not found. Falling back to the key as translation'
    )
  })

  it('allows for translation of enum values', () => {
    const Component = ({ translate }) => {
      const translateProduct = translate('productKinds')
      return <span>{translateProduct('overdraft')}</span>
    }

    expect(subject(Component, { locale: 'de_DE' })).toMatchSnapshot()
  })

  it('formats money correctly for the language', () => {
    const Component = ({ translate }) => <span>{translate('kebabLabel')}</span>

    expect(subject(Component, { locale: 'de_AT', amount: 42.37 })).toMatchSnapshot()
    expect(subject(Component, { locale: 'de_CH', amount: 2500.01 })).toMatchSnapshot()
  })

  describe('with custom formats', () => {
    const customFormats = {
      fr_FR: {
        number: {
          mark: {
            currency: 'USD',
            minimumFractionDigits: 2,
            style: 'currency'
          }
        }
      }
    }

    it('works with custom formats passed to withTranslation', () => {
      const Component = ({ translate }) => <span>{translate('kebabLabel')}</span>

      expect(subject(Component, { locale: 'fr_FR', amount: 42.37, formats: customFormats })).toMatchSnapshot()
    })

    it('allows for custom formats on a global level', () => {
      const withTranslation = createWithTranslation(globalTranslations, undefined, customFormats)

      const subject = (Component, { locale, scope, formats, ...rest }) => {
        const WrappedComponent = withTranslation({ translations, scope, customFormats })(Component)

        return mount(
          <TranslationProvider value={locale}>
            <WrappedComponent {...rest} />
          </TranslationProvider>
        )
      }

      const Component = ({ translate }) => <span>{translate('kebabLabel')}</span>

      expect(subject(Component, { locale: 'fr_FR', amount: 42.37 })).toMatchSnapshot()
    })
  })

  it('handles pluralisation', () => {
    const Component = ({ translate }) => <span>{translate('message')}</span>

    expect(subject(Component, { locale: 'en_US', numBurgers: 0 })).toMatchSnapshot()
    expect(subject(Component, { locale: 'en_US', numBurgers: 1 })).toMatchSnapshot()
    expect(subject(Component, { locale: 'en_US', numBurgers: 99 })).toMatchSnapshot()
  })

  it('allows for overwriting prop values by passing options to translate', () => {
    const Component = ({ translate }) => <span>{translate('title', { interpolated: 'Maschmüller' })}</span>

    expect(subject(Component, { locale: 'fr_FR', interpolated: 'Kurt'  })).toMatchSnapshot()
  })

  it('allows for disabling key fallback per translation through options', () => {
    const Component = ({ translate }) => <span>{translate('carsten.kurt.maschmüller', { fallbackToKey: false })}</span>

    expect(subject(Component, { locale: 'de_DE' })).toMatchSnapshot()
  })

  it('allows for setting a scope in withTranslation', () => {
    const Component = ({ translate }) => <span>{translate('maschmüller')}</span>

    expect(subject(Component, { locale: 'de_DE', scope: 'a.deeply.nested' })).toMatchSnapshot()

  })
})
