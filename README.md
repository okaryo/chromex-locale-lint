# chromex-locale-lint

chromex-locale-lint is a CLI tool that helps you validate your Chrome extension's localization files (`_locales/*/messages.json`). It checks for missing fields across locales and also validates the locale directory names against the list of locales supported by Google Chrome.

## Installation

To install chromex-locale-lint, you can use npm:

```sh
npm install --save-dev chromex-locale-lint
```

Or with yarn:

```sh
yarn add --dev chromex-locale-lint
```

## Usage

You can use chromex-locale-lint from the command line like this:

```sh
npx chromex-locale-lint --localesDir /path/to/locales --baseLang en
```


## Options

* `--localesDir`: The directory where your locales are located. Defaults to `_locales/`.
* `--baseLang`: The language to use as a basis for comparison with other languages. Defaults to `en`.
