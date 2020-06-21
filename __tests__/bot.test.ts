import {GithubBot} from '../src/bot'
import {GithubEventClient} from '../src/action'

describe('webhook input data', () => {
  const client = {
    insertComment: jest.fn(),
    findComments: jest.fn(),
    updateComment: jest.fn(),
    findPullRequestsByCommit: jest.fn()
  }
  const bot = new GithubBot((client as unknown) as GithubEventClient)

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('upsert with insert', async () => {
    client.findComments.mockReturnValue(Promise.resolve([{id: 123, body: ''}]))
    client.insertComment.mockReturnValue(Promise.resolve())

    await bot.upsertComment(3, '1<!---link=2%2}--->1', 'link.com', '123')
    expect(client.findComments).toHaveBeenCalledTimes(1)
    expect(client.updateComment).toHaveBeenCalledTimes(0)
    expect(client.insertComment).toHaveBeenCalledTimes(1)
    expect(client.insertComment).toHaveBeenCalledWith(
      3,
      '<!--- extract-checks-links-action ---><!--- 123 --->\n12link.com2}1'
    )
  })

  test('upsert with update', async () => {
    client.findComments.mockReturnValue(
      Promise.resolve([
        {
          id: 123,
          body: '<!--- extract-checks-links-action --->\n1<!---link=2%2--->1'
        }
      ])
    )
    client.updateComment.mockReturnValue(Promise.resolve())

    await bot.upsertComment(3, '1<!---link=2%2--->1', 'link.com', '123')
    expect(client.findComments).toHaveBeenCalledTimes(1)
    expect(client.insertComment).toHaveBeenCalledTimes(0)
    expect(client.updateComment).toHaveBeenCalledTimes(1)
    expect(client.updateComment).toHaveBeenCalledWith(
      '<!--- extract-checks-links-action ---><!--- 123 --->\n12link.com21',
      123
    )
  })
})
