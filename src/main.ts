import * as core from '@actions/core'
import * as github from '@actions/github'
import {GithubBot} from './bot'
import {GithubEventClient, processPayload} from './action'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token')
    const template = core.getInput('template')

    const {context} = github
    const {payload} = context
    const client = new GithubEventClient(github.getOctokit(token), context)
    const bot = new GithubBot(client)

    if (context.eventName !== 'status') {
      return
    }

    await processPayload(client, bot, payload, template)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
