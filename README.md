# translated-components
Brings component thinking to the i18n realm. Uses higher-order components to pass translated strings as props to components.
Inspired by on https://github.com/benoneal/translated-components

## Setup

- Run `npm i -S @compeon/translated-components` or `yarn add @compeon/translated-components` to add `translated-components` to your project.

- To increase browser support, you will have to polyfill `Intl` as [intl-messageformat](https://github.com/yahoo/intl-messageformat) depends on that global I18n API.
    You can do that either by configuring your preprocessor to add a suitable polyfill or by including the following script tag in the head of your document.

    ```js
    // index.html <head>
    <script src="https://cdn.polyfill.io/v2/polyfill.min.js" type="text/javascript" />
    ```

## Usage

- In order to provide the locale wrap the part of your application that should be translated in a `TranslationProvider`.
    Pass your desired locale as the `value` property. By default `de_DE` will be used.

    ```js
    // App.js
    render(
      <TranslationProvider value='en_GB'>
        <App />
      </TranslationProvider
    , document.findElementById('app'))
    ```

- Create a translations object with your supported languages as the primary keys.
    - the keys you use for your string templates should map to the props expected by your component
    - your default language should contain all strings that may be passed to the component

    ```js
    // Ruediger/translations.js
    export default {
        de_DE: {
            title: 'Ja hallo erstmal',
            subtitle: 'Ich weiß gar nicht, ob Sie\'s schon wussten'
        },
        en_GB: {
            title: 'Well hello there'
        }
    }
    ```

- Wrap your component to pass the translations

    ```js
    // Ruediger/index.js
    import withTranslation from '@compeon/translated-component'
    import translations from './translations'

    const Ruediger = ({title, subtitle}) => (
        <div>
            <h1>{title}</h1>
            <h4>{subtitle}</h4>
        </div>
    )

    export const RawRuediger = Ruediger
    export default withTranslation({translations})(Ruediger)

    // somewhere else within a TranslationProvider
    import Ruediger from 'components/Ruediger'
    ...
    <Ruediger />

    /* => with <TranslationProvider value='en_GB'>:
    <div>
        <h1>Well hello there</h1>
        <h4>Ich weiß gar nicht, ob Sie's schon wussten</h4>
    </div>
    */
    ```

## Advanced usage

#### Using props as params in template strings

Any props passed to your component are accessible to be referenced as template params in your translation strings.

```js
const translations = {
  de_DE: {
    title: 'Ja {salutation} erstmal'
  }
}
const Ruediger = ({title}) => <h1>{title}</h1>
export default translated({translations})(Ruediger)

...

<Ruediger salutation='buona sera' />
// -> <h1>Ja buona sera erstmal</h1>
```
<!--
#### Custom params for template strings

You can specify arbitrary template params by passing in a params object to `translated`. Each param must be a function which will be passed the component's props, and returns a string:

```js
const translations = {
  en_US: {
    offer: 'It sure is {temperature}, would you like some {drink}?'
  }
}
const params = {
  drink: ({temperature}) => temperature === 'hot' ? 'beer' : 'cocoa'
}
const Offer = ({offer}) => <p>{offer}</p>
export default translated({translations, params})(Offer)
...
<Offer temperature='cold' />
// -> <p>It sure is cold, would you like some cocoa?</p>
```
-->

#### Controlling how translations are passed to components

Sometimes, you may have translations that should only conditionally be passed as props, or which need to be formatted differently. You can control how the translations are passed to your component with a `mapTranslationsToProps` function, which is passed all translated strings, and the component's props, and must return an object.

```js
const translations = {
  en_US: {
    step_1: 'Steal underpants',
    step_2: '...',
    step_3: 'Profit!'
  }
}
const mapTranslationsToProps = (translations, {steps}) => ({
  steps: steps.map((step) => translations[step])
})
const Plan = ({steps}) => (
  <ul>{steps.map((step) => <li>{step}</li>)}</ul>
)
export const translated({translations, mapTranslationsToProps})(Plan)
...
<Plan steps={['step_1', 'step_2']} />
/* ->
  <ul>
    <li>Steal underpants</li>
    <li>...</li>
  </ul>
*/
```

#### Displaying money

This lib comes with a built-in `money` number format, which you can use to display currency correctly for the language provided:

```js
const translations = {
  en_US: {
    label: 'Buy now for {price, number, money}'
  }
}
const BuyButton = ({label}) => <button>{label}</button>
export default translated({translations})(BuyButton)
...
<BuyButton price={14.9536} />
// -> <button>Buy now for $14.95</button>
```

#### User-defined number/date/time formats

Finally, you can pass in custom configuration for intl-messageformat, to define how params are parsed. For example, if this lib didn't provide a money format (which does this for you), you could create a new way to define how money is displayed like so:

```js
const translations = {
  en_US: {
    total: 'Your purchase comes to {price, number, USD}'
  }
}
const format = {
  number: {
    USD: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }
  }
}
const Total = ({total}) => <p>{total}</p>
export default translated({translations, format})(Total)
...
<Total price={9543.235} />
// -> <p>Your purchase comes to $9,543.23</p>
```
