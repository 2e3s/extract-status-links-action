import * as event from './action'
import {processTemplate} from './template'

export class GithubBot {
  private COMMENT_HEADER = '<!--- extract-checks-links-action --->'

  public constructor(private githubClient: event.GithubEventClient) {}

  private getGeneratedBody(body: string, commitSha: string): string {
    return `${this.COMMENT_HEADER}<!--- ${commitSha} --->\n${body}`
  }

  private async findComments(pullRequestNumber: number): Promise<Array<event.CommentData>> {
    console.log(`Searching my comment at PR #${pullRequestNumber}`)
    const existingComments = await this.githubClient.findComments(pullRequestNumber)

    return existingComments.filter(({body}) => body.startsWith(this.COMMENT_HEADER))
  }

  private static belongsToCommit(comment: string, commitSha: string): boolean {
    return comment.includes(`<!--- ${commitSha} --->`)
  }

  private async updateCommentPartially(comment: event.CommentData, link: string): Promise<void> {
    const processedBody = processTemplate(comment.body, link)
    console.log(`Updating partially "${processedBody}" in comment #${comment.id}`)

    return this.githubClient.updateComment(processedBody, comment.id)
  }

  private async updateComment(processedBody: string, commentId: number): Promise<void> {
    console.log(`Updating "${processedBody}" for comment ${commentId}`)

    return this.githubClient.updateComment(processedBody, commentId)
  }

  private async insertComment(processedBody: string, pullRequestNumber: number): Promise<void> {
    console.log(`Inserting "${processedBody}" to PR ${pullRequestNumber}`)

    return this.githubClient.insertComment(pullRequestNumber, processedBody)
  }

  public async upsertComment(
    pullRequestNumber: number,
    template: string,
    link: string,
    commitSha: string
  ): Promise<void> {
    const commentsList = await this.findComments(pullRequestNumber)

    if (commentsList.length > 0) {
      const comment = commentsList[0]

      if (!GithubBot.belongsToCommit(comment.body, commitSha)) {
        return this.updateComment(
          processTemplate(this.getGeneratedBody(template, commitSha), link),
          comment.id
        )
      }

      return this.updateCommentPartially(comment, link)
    } else {
      return this.insertComment(
        processTemplate(this.getGeneratedBody(template, commitSha), link),
        pullRequestNumber
      )
    }
  }
}
