import * as core from '@actions/core'
import {SarifParser} from './sarif-parser'

async function run(): Promise<void> {
  try {
    const failOnAnyString: string = core.getInput('failOnAny')
    const failOnErrorsString: string = core.getInput('failOnErrors')
    const failOnWarningsString: string = core.getInput('failOnWarnings')
    const failOnNotesString: string = core.getInput('failOnNotes')
    const jmesPathQuery: string = core.getInput('jmesPathQuery')
    const sarifFilePath: string = core.getInput('sarifFile')

    core.debug(`failOnAny: ${failOnAnyString}`)
    core.debug(`failOnErrors: ${failOnErrorsString}`)
    core.debug(`failOnWarnings: ${failOnWarningsString}`)
    core.debug(`jmesPathQuery: ${jmesPathQuery}`)
    core.debug(`sarifFilePath: ${sarifFilePath}`)

    // Ensure parmeters can be parsed
    if (failOnAnyString === undefined)
      throw new Error('The value for `failOnAny` must be defined')
    if (failOnErrorsString === undefined)
      throw new Error('The value for `failOnErrors` must be defined')
    if (failOnWarningsString === undefined)
      throw new Error('The value for `failOnWarnings` must be defined')
    if (failOnNotesString === undefined)
      throw new Error('The value for `failOnNotes` must be defined')

    // Ensure parmeters have the right value
    if (
      failOnAnyString.toLocaleLowerCase() !== 'false' &&
      failOnAnyString.toLocaleLowerCase() !== 'true'
    )
      throw new Error(
        `Unable to parse the value '${failOnAnyString}' as a boolean for 'failOnAny'`
      )
    if (
      failOnErrorsString.toLocaleLowerCase() !== 'false' &&
      failOnErrorsString.toLocaleLowerCase() !== 'true'
    )
      throw new Error(
        `Unable to parse the value '${failOnErrorsString}' as a boolean for 'failOnErrorsString'`
      )
    if (
      failOnWarningsString.toLocaleLowerCase() !== 'false' &&
      failOnWarningsString.toLocaleLowerCase() !== 'true'
    )
      throw new Error(
        `Unable to parse the value '${failOnWarningsString}' as a boolean for 'failOnWarningsString'`
      )
    if (
      failOnNotesString.toLocaleLowerCase() !== 'false' &&
      failOnNotesString.toLocaleLowerCase() !== 'true'
    )
      throw new Error(
        `Unable to parse the value '${failOnNotesString}' as a boolean for 'failOnNotesString'`
      )

    const failOnAny: boolean = failOnAnyString.toLocaleLowerCase() === 'true'
    const failOnErrors: boolean =
      failOnErrorsString.toLocaleLowerCase() === 'true'
    const failOnWarnings: boolean =
      failOnWarningsString.toLocaleLowerCase() === 'true'
    const failOnNotes: boolean =
      failOnNotesString.toLocaleLowerCase() === 'true'

    const sarifParser: SarifParser = new SarifParser(sarifFilePath)

    const errorsDetected: boolean = await sarifParser.hasErrorAlerts()
    const warningsDetected: boolean = await sarifParser.hasWarningAlerts()
    const notesDetected: boolean = await sarifParser.hasNoteAlerts()

    core.debug(`errorsDetected: ${errorsDetected}`)
    core.debug(`warningsDetected: ${warningsDetected}`)
    core.debug(`notesDetected: ${notesDetected}`)

    if (
      (failOnAny && (errorsDetected || warningsDetected || notesDetected)) ||
      (failOnErrors && errorsDetected) ||
      (failOnWarnings && warningsDetected) ||
      (failOnNotes && notesDetected)
    ) {
      const message =
        'Results were found that met the fail workflow criteria:\n' +
        `Errors: ${errorsDetected}\n` +
        `Warnings: ${warningsDetected}\n` +
        `Notes: ${notesDetected}\n`

      core.setFailed(message)
    }

    if (jmesPathQuery === undefined || jmesPathQuery.length === 0) return

    const queryHasResults: boolean = await sarifParser.queryLogFile(
      jmesPathQuery
    )

    core.debug(`queryHasResults: ${queryHasResults}`)

    if (queryHasResults) {
      core.setFailed('The JMESPath query found results')
    }
  } catch (error) {
    let message = 'An unknown error occured.'

    if (error instanceof Error) message = error.message

    core.setFailed(message)
  }
}

run()
