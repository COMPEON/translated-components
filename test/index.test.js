import React from 'react'
import { mount } from 'enzyme'
import { TranslationProvider, withTranslation } from '../src'

const SomeTestComponent = ({
  notToBeTranslated = 100,
  title = 'a default title',
  'kebab-label': kebabLabel = 'a default kebab label',
  message = 'a default message'
}) => (
  <React.Fragment>
    <img width={notToBeTranslated} />
    <h1>{title}</h1>
    <h2>{kebabLabel}</h2>
    <p>{message}</p>
  </React.Fragment>
)

const translations = {
  de_DE: {
    title: 'Dies ist ein fester Titel',
    'kebab-label': 'Du, du hast.',
    message: 'Eine Schweinshaxe, bitte.'
  },
  de_AT: {
    title: 'Dies ist ein {customTitle}',
    'kebab-label': 'Du hast {amount, number, money}!',
    message: 'Hier wird nie etwas anderes stehen.'
  },
  de_CH: {
    'kebab-label': 'Du hast {amount, number, money}!'
  },
  en_GB: {
    title: 'Good day, Sir.'
  },
  en_US: {
    message: 'Let\'s eat {numBurgers, plural, =0 {no burgers} =1 {one burger} other {# burgers}} today.'
  },
  fr_FR: {
    title: 'This is going to be {interpolated}'
  }
}

const params = {
  interpolated: ({ interpolated = '' }) => `really ${interpolated.toUpperCase()}!`
}

describe('Translate components', () => {
  const TranslatedTestComponent = withTranslation({ translations, params })(SomeTestComponent)

  const subject = ({ locale, ...rest }) => (
    mount(
      <TranslationProvider value={locale}>
        <TranslatedTestComponent {...rest} />
      </TranslationProvider>
    )
  )
  it('does not touch non-translation props', () => {
    expect(subject({ notToBeTranslated: 99 })).toMatchSnapshot()
  })

  it('passes default `de_DE` translated strings to wrapped components', () => {
    expect(subject({})).toMatchSnapshot()
  })

  it('passes translated strings alongside default fallbacks to wrapped components', () => {
    expect(subject({ locale: 'en_GB' })).toMatchSnapshot()
  })

  it('formats money correctly for the language', () => {
    expect(subject({ locale: 'de_AT', customTitle: 'Zipfelklatschr', amount: 42.37 })).toMatchSnapshot()
    expect(subject({ locale: 'de_CH', customTitle: 'Toblerone', amount: 2500.01 })).toMatchSnapshot()
  })

  it('handles pluralisation', () => {
    expect(subject({ locale: 'en_US', numBurgers: 0 })).toMatchSnapshot()
    expect(subject({ locale: 'en_US', numBurgers: 1 })).toMatchSnapshot()
    expect(subject({ locale: 'en_US', numBurgers: 99 })).toMatchSnapshot()
  })

  it('transforms template params with supplied functions', () => {
    expect(subject({ locale: 'fr_FR', interpolated: 'french' })).toMatchSnapshot()
  })
})
