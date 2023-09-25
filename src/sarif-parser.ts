import * as core from '@actions/core'
import * as fs from 'fs'
import {Log, ReportingDescriptor, ToolComponent} from 'sarif' // eslint-disable-line import/no-unresolved

export class SarifParser {
  readonly sarifLog: Log

  constructor(sarifFilePath: string) {
    core.debug(`SARIF File Path: ${sarifFilePath}`)
    if (!fs.existsSync(sarifFilePath)) {
      throw new Error('SARIF file does not exist')
    }

    const buffer = fs.readFileSync(sarifFilePath, 'utf-8')
    this.sarifLog = JSON.parse(buffer)
  }

  async queryLogFile(jmesPathQuery: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const jmespath = require('jmespath')

    core.debug(`Running query ${jmesPathQuery} ...`)
    const result = jmespath.search(this.sarifLog, jmesPathQuery)

    if (result === null || result === undefined) {
      core.debug(`Result of query is ${result} ...`)
      return false
    }

    return result.length > 0
  }

  async hasResults(): Promise<boolean> {
    let hasResults = false

    for (const run of this.sarifLog.runs) {
      if (run.results !== undefined && run.results.length > 0) {
        hasResults = true
        break
      }
    }

    return hasResults
  }

  async hasErrorAlerts(): Promise<boolean> {
    return this.hasAlert('error')
  }

  async hasWarningAlerts(): Promise<boolean> {
    return this.hasAlert('warning')
  }

  async hasNoteAlerts(): Promise<boolean> {
    return this.hasAlert('note')
  }

  private async hasAlert(level: string): Promise<boolean> {
    let hasAlert = false

    core.debug(`Alert level: ${level} ...`)

    for (const run of this.sarifLog.runs) {
      if (run.results === null || run.results === undefined) {
        core.debug(`Results are ${run.results}`)
        continue
      }

      if (run.tool.extensions === null || run.tool.extensions === undefined) {
        core.debug(`Tool Extensions are ${run.tool.extensions}`)
        continue
      }

      for (const result of run.results) {
        if (result.rule === null || result.rule === undefined) {
          core.debug(`Result Rule is ${result.rule}`)
          continue
        }

        if (result.rule.index === null || result.rule.index === undefined) {
          core.debug(`Result Rule Index is ${result.rule.index}`)
          continue
        }

        if (
          result.rule.toolComponent === null ||
          result.rule.toolComponent === undefined
        ) {
          core.debug(
            `Result Rule Tool Component is ${result.rule.toolComponent}`
          )
          continue
        }

        if (
          result.rule.toolComponent.index === null ||
          result.rule.toolComponent.index === undefined
        ) {
          core.debug(
            `Result Rule Tool Component Index is ${result.rule.toolComponent.index}`
          )
          continue
        }

        core.debug(
          `Result Rule Tool Component Index: ${result.rule.toolComponent.index}`
        )

        const toolComponent: ToolComponent =
          run.tool.extensions[result.rule.toolComponent.index]

        if (toolComponent === null || toolComponent === undefined) {
          core.debug(`Tool Component is ${toolComponent}`)
          continue
        }

        if (toolComponent.rules === null || toolComponent.rules === undefined) {
          core.debug(`Tool Component Rules are ${toolComponent.rules}`)
          continue
        }

        core.debug(`Result Rule Index: ${result.rule.index}`)

        const reportingDescriptor: ReportingDescriptor =
          toolComponent.rules[result.rule.index]

        if (
          reportingDescriptor.defaultConfiguration === null ||
          reportingDescriptor.defaultConfiguration === undefined
        ) {
          core.debug(
            `Reporting Descriptor Default Configuration are ${reportingDescriptor.defaultConfiguration}`
          )
          continue
        }

        core.debug(
          `Reporting Descriptor Default Configuration Level: ${reportingDescriptor.defaultConfiguration.level}`
        )
        if (reportingDescriptor.defaultConfiguration.level === level) {
          hasAlert = true
          break
        }
      }

      if (hasAlert) break
    }

    return hasAlert
  }
}
