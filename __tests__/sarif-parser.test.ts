import * as path from 'path'
import {expect, test} from '@jest/globals'
import {SarifParser} from '../src/sarif-parser'

test('throws file now found', async () => {
  const sarifFilePath: string = 'something that does not exist'

  expect(() => {
    new SarifParser(sarifFilePath)
  }).toThrow('SARIF file does not exist')
})

test('Query SARIF file with results', async () => {
  const sarifFilePath: string = path.join(
    __dirname,
    'sarif-files',
    'sarif-with-error-results.json'
  )
  const jmesPathQuery: string = 'runs[*].results'

  let sarifParser: SarifParser = new SarifParser(sarifFilePath)

  let anyResults = await sarifParser.queryLogFile(jmesPathQuery)

  expect(anyResults).toBe(true)
})

test('Query SARIF file with empty results', async () => {
  const sarifFilePath: string = path.join(
    __dirname,
    'sarif-files',
    'sarif-without-results.json'
  )
  const jmesPathQuery: string = 'runs[*].results'

  let sarifParser: SarifParser = new SarifParser(sarifFilePath)

  let anyResults = await sarifParser.queryLogFile(jmesPathQuery)

  expect(anyResults).toBe(true)
})

test('SARIF file with results', async () => {
  const sarifFilePath: string = path.join(
    __dirname,
    'sarif-files',
    'sarif-with-error-results.json'
  )

  let sarifParser: SarifParser = new SarifParser(sarifFilePath)

  let anyResults = await sarifParser.hasResults()

  expect(anyResults).toBe(true)
})

test('SARIF file without results', async () => {
  const sarifFilePath: string = path.join(
    __dirname,
    'sarif-files',
    'sarif-without-results.json'
  )

  let sarifParser: SarifParser = new SarifParser(sarifFilePath)

  let anyResults = await sarifParser.hasResults()

  expect(anyResults).toBe(false)
})

test('SARIF file with errors', async () => {
  const sarifFilePath: string = path.join(
    __dirname,
    'sarif-files',
    'sarif-with-error-results.json'
  )

  let sarifParser: SarifParser = new SarifParser(sarifFilePath)

  let anyResults = await sarifParser.hasErrorAlerts()

  expect(anyResults).toBe(true)
})

test('SARIF file without errors', async () => {
  const sarifFilePath: string = path.join(
    __dirname,
    'sarif-files',
    'sarif-with-warning-results.json'
  )

  let sarifParser: SarifParser = new SarifParser(sarifFilePath)

  let anyResults = await sarifParser.hasErrorAlerts()

  expect(anyResults).toBe(false)
})

test('SARIF file with warnings', async () => {
  const sarifFilePath: string = path.join(
    __dirname,
    'sarif-files',
    'sarif-with-warning-results.json'
  )

  let sarifParser: SarifParser = new SarifParser(sarifFilePath)

  let anyResults = await sarifParser.hasWarningAlerts()

  expect(anyResults).toBe(true)
})

test('SARIF file without warnings', async () => {
  const sarifFilePath: string = path.join(
    __dirname,
    'sarif-files',
    'sarif-with-error-results.json'
  )

  let sarifParser: SarifParser = new SarifParser(sarifFilePath)

  let anyResults = await sarifParser.hasWarningAlerts()

  expect(anyResults).toBe(false)
})
