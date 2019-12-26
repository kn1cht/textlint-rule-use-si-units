# textlint-rule-use-si-units



## Install

Install with [npm](https://www.npmjs.com/):

    npm install textlint-rule-use-si-units

## Usage

Via `.textlintrc`(Recommended)

```json
{
    "rules": {
        "use-si-units": true
    }
}
```

Via CLI

```
textlint --rule use-si-units README.md
```

### Build

Builds source codes for publish to the `lib` folder.
You can write ES2015+ source codes in `src/` folder.

    npm run build

### Tests

Run test code in `test` folder.
Test textlint rule by [textlint-tester](https://github.com/textlint/textlint-tester).

    npm test

## License

ISC © kn1cht
