# SARIF File Parser

This action will parse a SARIF file and allows you to fail the workflow when the specified conditions exists. The intention is stop any worflow that uses this action in the event the scanned code has issues that could result in negative consequences.

## Inputs
- `failOnAny` - When set to true, this will fail if any results are found in the SARIF file, defaults to `false`
- `failOnErrors` - When set to true, this will fail if there are `error` level results in the SARIF file, defaults to `true`
- `failOnWarnings` - When set to true, this will fail if there are `warning` level results in the SARIF file, defaults to `false`
- `failOnNotes` - When set to true, this will fail if there are `note` level results in the SARIF file, defaults to `false`
- `jmesPathQuery` - This allows you to specify a JMESPath query that will query the SARIF file and fail the workflow if results are found, this is optional
- `sarifFile` - The location of the SARIF file to proccess, this is required

## Example
The following YAML will fail if there are any results:
```yaml
name: 'parse-sarif-file'
on:
  workflow_dispatch:

jobs:
  parse-file: # make sure the action works on a clean machine without building
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ./.github/sarif-file-results-parser-action
        with:
          # Will fail if any results are found
          failOnAny: true
          # SARIF files will have a *.sarif extension, this is just a test file
          sarifFile: ./__tests__/sarif-files/sarif-without-results.json
```

The following YAML will fail if there are any errors or if the query finds results:
```yaml
name: 'parse-sarif-file'
on:
  workflow_dispatch:

jobs:
  parse-file: # make sure the action works on a clean machine without building
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ./.github/sarif-file-results-parser-action
        with:
          # failOnError is defaulted to true, no need to set it
          # This query will locate any results where it violates the 'js/xss-through-dom' rule and fail the workflow
          jmesPathQuery: runs[*].results[?ruleId == 'js/xss-through-dom']
          # SARIF files will have a *.sarif extension, this is just a test file
          sarifFile: ./__tests__/sarif-files/sarif-without-results.json
```
## Additional Resources
For details on writing JMESPath queries, visit [jmespath.org](https://jmespath.org/).
