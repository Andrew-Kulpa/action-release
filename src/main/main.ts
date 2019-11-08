import * as github from '@actions/github';
import * as throttling from '@octokit/plugin-throttling';
import { setFailed, warning, info } from '@actions/core';
import { Action } from './action';
import { FileArtifactGlobber } from './artifactGlobber';
import { ActionInputs } from './inputs';
import { GitHubRelease } from './release';
import { GitHubArtifactUploader } from './artifactUploader';


/**
 * Creates a connection to GitHub which throttles requests when the
 * request quota is exhaused
 * @param {string} token
 * @return {github.GitHub}
 */
function createGitHubConnection(token: string): github.GitHub {
  github.GitHub.plugin(throttling);
  return new github.GitHub(token, {
    onRateLimit: (retryAfter, options): boolean => {
      warning(`Request quota exhausted for request ${options.method} ${options.url}`);
      if (options.request.retryCount === 0) {
        info(`Retrying after ${retryAfter} seconds!`);
        return true;
      } else {
        return false;
      }
    },
    onAbuseLimit: (_retryAfter, options): void => {
      warning(`Abuse detected for request ${options.method} ${options.url}`);
    },
  });
}

/**
 * Creates a GitHub Release Action
 * @return {Action}
 */
function createAction(): Action {
  const context = github.context;
  const globber = new FileArtifactGlobber();
  const inputs = new ActionInputs(globber, context);

  const git = createGitHubConnection(inputs.token);

  const release = new GitHubRelease(context, git);
  const uploader = new GitHubArtifactUploader(release);
  return new Action(inputs, release, uploader);
}

/**
 * Runs the GitHub Action
 * @return {void}
 */
async function run(): Promise<void> {
  try {
    const action = createAction();
    await action.run();
  } catch (error) {
    setFailed(error.message);
  }
}

run();
