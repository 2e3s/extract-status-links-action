import {GithubBot} from '../src/bot'
import {GithubEventClient, processPayload} from '../src/action'

describe('webhook input data', () => {
  const client = {
    insertComment: jest.fn(),
    findComments: jest.fn(),
    updateComment: jest.fn(),
    findPullRequestsByCommit: jest.fn()
  }
  const botMock = {
    upsertComment: jest.fn()
  }
  const realBot = new GithubBot((client as unknown) as GithubEventClient)
  const payload = {
    state: 'success',
    target_url: 'link.com',
    sha: '123'
  }
  const template = '1<!---link=2%2--->1'

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('incomplete data', async () => {
    client.findPullRequestsByCommit.mockReturnValue(Promise.resolve([]))

    try {
      await processPayload(
        (client as unknown) as GithubEventClient,
        (botMock as unknown) as GithubBot,
        {},
        template
      )

      return Promise.reject('Error expected')
    } catch {}

    expect(botMock.upsertComment).toHaveBeenCalledTimes(0)
  })

  test('no pull requests', async () => {
    client.findPullRequestsByCommit.mockReturnValue(Promise.resolve([]))

    await processPayload(
      (client as unknown) as GithubEventClient,
      (botMock as unknown) as GithubBot,
      payload,
      template
    )

    expect(botMock.upsertComment).toHaveBeenCalledTimes(0)
  })

  test('commit is not head', async () => {
    client.findPullRequestsByCommit.mockReturnValue(
      Promise.resolve([
        {
          number: 2,
          head: {sha: '456'}
        }
      ])
    )

    await processPayload(
      (client as unknown) as GithubEventClient,
      (botMock as unknown) as GithubBot,
      payload,
      template
    )

    expect(botMock.upsertComment).toHaveBeenCalledTimes(0)
  })

  test('successful upsert integration', async () => {
    client.findComments.mockReturnValue(Promise.resolve([]))
    client.findPullRequestsByCommit.mockReturnValue(
      Promise.resolve([
        {
          number: 2,
          head: {sha: '123'}
        }
      ])
    )

    await processPayload((client as unknown) as GithubEventClient, realBot, payload, template)
    expect(client.insertComment).toHaveBeenCalledTimes(1)
    expect(client.insertComment).toHaveBeenCalledWith(
      2,
      '<!--- extract-checks-links-action ---><!--- 123 --->\n12link.com21'
    )
  })
})
