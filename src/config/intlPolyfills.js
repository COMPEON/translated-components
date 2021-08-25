import { shouldPolyfill as shouldPolyfillCanonicalLocales } from '@formatjs/intl-getcanonicallocales/should-polyfill'
import { shouldPolyfill as shouldPolyfillLocale } from '@formatjs/intl-locale/should-polyfill'
import { shouldPolyfill as shouldPolyfillPluralRules } from '@formatjs/intl-pluralrules/should-polyfill'
import { shouldPolyfill as shouldPolyfillNumberFormat } from '@formatjs/intl-numberformat/should-polyfill'

if (shouldPolyfillCanonicalLocales()) {
  import('@formatjs/intl-getcanonicallocales/polyfill')
}
if (shouldPolyfillLocale()) import('@formatjs/intl-locale/polyfill')
if (shouldPolyfillPluralRules()) {
  import('@formatjs/intl-pluralrules/polyfill').then(() => {
    import('@formatjs/intl-pluralrules/locale-data/de')
    import('@formatjs/intl-pluralrules/locale-data/en')
    import('@formatjs/intl-pluralrules/locale-data/fr')
    import('@formatjs/intl-pluralrules/locale-data/uk')
  })
}

if (shouldPolyfillNumberFormat()) {
  import('@formatjs/intl-numberformat/polyfill').then(() => {
    import('@formatjs/intl-numberformat/locale-data/de')
  })
}
