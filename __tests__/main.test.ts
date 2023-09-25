import * as process from 'process'
import * as path from 'path'
import * as childProcess from 'child_process'
import {expect, test} from '@jest/globals'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_failOnAny'] = 'false'
  process.env['INPUT_failOnErrors'] = 'false'
  process.env['INPUT_failOnWarnings'] = 'false'
  process.env['INPUT_failOnNotes'] = 'false'
  process.env['INPUT_jmesPathQuery'] = 'false'
  process.env['INPUT_sarifFile'] = path.join(
    __dirname,
    'sarif-files',
    'sarif-with-error-results.json'
  )

  const nodePath = process.execPath
  const mainJsFile = path.join(__dirname, '..', 'lib', 'main.js')
  const options: childProcess.ExecFileSyncOptions = {
    stdio: 'inherit',
    env: process.env
  }
  
  try {
    console.log(
      childProcess.execFileSync(nodePath, [mainJsFile], options).toString()
    )
  } catch(error) {
    console.log(error)
  }
})
