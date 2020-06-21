import {Context} from '@actions/github/lib/context'
import {GitHub} from '@actions/github/lib/utils'
import {GithubBot} from './bot'
import {WebhookPayload} from '@actions/github/lib/interfaces'

export type GithubType = InstanceType<typeof GitHub>

export interface CommentData {
  body: string
  id: number
}

export interface PullRequest {
  number: number
  head: {
    sha: string
  }
}

function unwrap<T>(arg: null | undefined | T, error?: string): T {
  if (!arg) {
    throw new Error(error ?? 'Empty value')
  }

  return arg
}

export class GithubEventClient {
  public constructor(private githubClient: GithubType, private context: Context) {}

  public async findComments(pullRequestNumber: number): Promise<Array<CommentData>> {
    return (
      await this.githubClient.issues.listComments({
        ...this.context.repo,
        ['issue_number']: pullRequestNumber
      })
    ).data
  }

  public async insertComment(pullRequestNumber: number, body: string): Promise<void> {
    await this.githubClient.issues.createComment({
      ...this.context.repo,
      ['issue_number']: pullRequestNumber,
      body
    })
  }

  public async updateComment(body: string, commentId: number): Promise<void> {
    await this.githubClient.issues.updateComment({
      ...this.context.repo,
      ['comment_id']: commentId,
      body
    })
  }

  public async findPullRequestsByCommit(commitSha: string): Promise<Array<PullRequest>> {
    return (
      await this.githubClient.repos.listPullRequestsAssociatedWithCommit({
        ...this.context.repo,
        ['commit_sha']: commitSha
      })
    ).data
  }
}

export async function processPayload(
  client: GithubEventClient,
  bot: GithubBot,
  payload: WebhookPayload,
  template: string
): Promise<void> {
  const payloadJson = JSON.stringify(payload, undefined, 2)

  if (unwrap<string>(payload.state, `Missing state of status ${payloadJson}`) !== 'success') {
    return
  }

  const commitSha = unwrap<string>(payload['sha'], `Missing commit SHA ${payloadJson}`)
  if (payload['target_url'] === undefined) {
    return
  }
  const url = unwrap<string>(payload['target_url'])

  const pullRequests = await client.findPullRequestsByCommit(commitSha)
  if (pullRequests.length < 1) {
    console.log(`Pull requests for commit ${commitSha} are not found`)
  }
  const headPullRequests = pullRequests.filter(pullRequest => pullRequest.head.sha === commitSha)
  if (headPullRequests.length < 1) {
    console.log(`Commit ${commitSha} is nowhere head`)
  }

  await Promise.all(
    headPullRequests.map(
      async (pullRequest): Promise<void> =>
        bot.upsertComment(pullRequest.number, template, url, commitSha)
    )
  )
}
