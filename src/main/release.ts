import {
  ReposCreateReleaseResponse,
  Response,
  ReposGetReleaseByTagResponse,
  ReposUploadReleaseAssetResponse,
} from '@octokit/rest';

import { Context } from '@actions/github/lib/context';
import { info } from '@actions/core';
import { GitHub } from '@actions/github';

export interface Release {
  create(options: ReleaseOptions): Promise<Response<ReposCreateReleaseResponse>>;
  uploadAsset(options: UploadOptions): Promise<Response<ReposUploadReleaseAssetResponse>>;
  deleteByTag(tag: string): Promise<void>;
}

export type ReleaseOptions = {
  tag_name: string,
  body?: string,
  target_commitish?: string,
  draft?: boolean,
  prerelease?: boolean,
  name?: string
};

export type UploadOptions = {
  url: string,
  headers: {
    'content-length': number,
    'content-type': string,
  }
  file: string | object,
  name: string
};

/**
 * GitHubRelease implements the Release interface.
 */
export class GitHubRelease implements Release {
  /**
   * GitHubRelease takes the current GitHub Actions context as well
   * as an instance of '@actions/github'
   * @param {Context} context
   * @param {GitHub} git
   */
  constructor(
    private context: Context,
    private git: GitHub,

  ) { }

  /**
   * Create a release
   * @param {ReleaseOptions} options
   * @return {Promise<ReposCreateReleaseResponse>}
   */
  async create(options: ReleaseOptions): Promise<Response<ReposCreateReleaseResponse>> {
    const response = await this.git.repos.createRelease({
      ...this.context.repo,
      ...options,
    });
    return response;
  }

  /**
   * Uploads an asset to a release
   * @param {UploadOptions} options - the Asset object representing the release artifact
   * @return {Promise<Response<ReposUploadReleaseAssetResponse>>}
   */
  async uploadAsset(options: UploadOptions): Promise<Response<ReposUploadReleaseAssetResponse>> {
    return this.git.repos.uploadReleaseAsset({
      ...options,
    });
  }

  /**
   * Deletes any matching release and reference
   * @param {string} tag
   * @return {Promise<void>}
   */
  async deleteByTag(tag: string): Promise<void> {
    let release: Response<ReposGetReleaseByTagResponse>;
    try {
      release = await this.git.repos.getReleaseByTag({
        ...this.context.repo,
        tag,
      });
    } catch (error) {
      if (error.status === 404) {
        info(`Release with tag ${tag} was not found`);
        return;
      } else {
        throw new Error(`Failed to delete matching release: ${error.message}`);
      }
    }
    await this.delete(release);
    await this.deleteRef(tag);
  }

  /**
   * Deletes a matching release
   * @param {Response<ReposGetReleaseByTagResponse>} release
   * @return {Promise<void>}
   */
  private async delete(release: Response<ReposGetReleaseByTagResponse>): Promise<void> {
    await this.git.repos.deleteRelease({
      ...this.context.repo,
      release_id: release.data.id,
    });
  }

  /**
   * Deletes a matching reference
   * @param {string} ref
   * @return {Promise<void>}
   */
  private async deleteRef(ref: string): Promise<void> {
    await this.git.git.deleteRef({
      ...this.context.repo,
      ref: `tags/${ref}`,
    });
  }
}
