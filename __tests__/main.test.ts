import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

describe('webhook input data', () => {
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }

  beforeEach(() => {
    process.env['INPUT_TOKEN'] = '123'
    process.env['INPUT_TEMPLATE'] = 'abc'
    delete process.env['GITHUB_EVENT_NAME']
    delete process.env['GITHUB_EVENT_PATH']
  })

  test('test runs with error', async () => {
    process.env['GITHUB_EVENT_NAME'] = 'status'
    process.env['GITHUB_EVENT_PATH'] = path.join(__dirname, '.', 'context_payload_error.json')

    try {
      cp.execSync(`node ${ip}`, options)

      return Promise.reject('Error is not found')
    } catch (error) {
      expect(error.stderr.toString()).toBe('')
      expect(error.stdout.toString()).toContain('Missing commit SHA')
    }
  })

  test('test runs without error', async () => {
    try {
      cp.execSync(`node ${ip}`, options)
    } catch (error) {
      expect(error.stdout.toString()).toBe('')

      throw error
    }
  })
})
