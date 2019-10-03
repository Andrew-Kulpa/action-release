import {GitHub, context} from '@actions/github';
import {setFailed, getInput} from '@actions/core';
import {Asset} from './asset';
import {basename} from 'path';
import {getType} from 'mime';
import {lstatSync, readFileSync, existsSync} from 'fs';
import {
  ReposCreateReleaseResponse,
  Response,
  ReposGetReleaseByTagResponse,
  ReposUploadReleaseAssetResponse,
} from '@octokit/rest';


const github = new GitHub(process.env.GITHUB_TOKEN!);
run();

/**
 * Run the action
 * @return {void}
 */
async function run(): Promise<void> {
  try {
    await deleteOldRelease();

    if (getInput('overwrite') == 'true') {
      deleteOldRelease( );
    }
    const release = await createGithubRelease();
    uploadAssets(release.data.upload_url);

    console.log(`Release uploaded to ${release.data.html_url}`);
  } catch (error) {
    console.log(error);
    setFailed(error.message);
  }
}

/**
 * Uploads all linked assets to a release
 * @param {string} uploadUrl - upload url for the release
 * @return {void}
 */
function uploadAssets(uploadUrl: string): void {
  let assets = getInput('files').split('\n');
  assets = assets ? assets : [getInput('file')];
  console.log(`Uploading assets to ${uploadUrl}:`)
  console.log(assets);
  for (const asset of assets) {
    if(asset && existsSync(asset)){
      uploadAsset(uploadUrl, getAsset(asset));
    } else {
      console.log(`Asset '${asset}' skipped -- null or does not exist`)
    }
  }
}

/**
 * Deletes any matching release and reference
 * @return {Promise<void>}
 */
async function deleteOldRelease(): Promise<void> {
  if (getInput('overwrite') != 'true') {
    return;
  }
  let release;
  try {
    release = await github.repos.getReleaseByTag({
      ...context.repo,
      tag: getTag(),
    });
  } catch (error) {
    if ( error.status == 404) {
      // ignore if the release wasnt found
      return;
    } else {
      throw error;
    }
  }
  await deleteRelease(release);
  await deleteRef();
}

/**
 * Deletes a matching release
 * @param {Release<ReposGetReleaseByTagResponse>} release - release reference
 * @return {Promise<void>}
 */
async function deleteRelease(release:Response<ReposGetReleaseByTagResponse>): Promise<void> {
  try {
    github.repos.deleteRelease({
      ...context.repo,
      release_id: release.data.id,
    });
  } catch (error) {
    if ( error.status == 404) {
      // ignore if the release wasnt found
    } else {
      throw error;
    }
  }
}

/**
 * Deletes a matching reference
 * @return {Promise<void>}
 */
async function deleteRef(): Promise<void> {
  try {
    await github.git.deleteRef({
      ...context.repo,
      ref: `tags/${getTag()}`,
    });
  } catch (error) {
    if ( error.status == 404) {
      // ignore if the ref wasnt found
    } else {
      throw error;
    }
  }
}

/**
 * Resolves the release tag
 * @return {string}
 */
function getTag(): string {
  let tag = '';
  if (getInput('tag')) {
    tag = getInput('tag');
  } else if (getInput('name')) {
    tag = getInput('name');
  } else if (process.env.GITHUB_REF!.startsWith('refs/tags/')) {
    tag = process.env.GITHUB_REF!.split('/')[2];
  } else {
    throw new Error(
        'A tag is required for GitHub Releases, ' +
      'please set via the tag / name inputs or tagging the Github reference');
  }
  return tag;
}

/**
 * Resolves the release name
 * @return {string}
 */
function getName(): string {
  return getInput('name') || getTag();
}

/**
 * Resolves the release body
 * @return {string}
 */
function getReleaseBody(): string {
  const bodyFilePath = getInput('bodyFile');
  const body = bodyFilePath ? bodyFilePath : getInput('body');
  return body;
}

/**
 * Create a release
 * @return {Promise<ReposCreateReleaseResponse>}
 */
async function createGithubRelease(): Promise<Response<ReposCreateReleaseResponse>> {
  const response = await github.repos.createRelease({
    ...context.repo,
    tag_name: getName(),
    name: getTag(),
    body: getReleaseBody(),
    target_commitish: context.sha,
    draft: getInput('draft') == 'true',
    prerelease: getInput('prerelease') == 'true',
  });
  return response;
}

/**
 * Returns an Asset object from a retrieved file
 * @param {string} path - path to local file
 * @return {Asset}
 */
function getAsset(path: string): Asset {
  return {
    name: basename(path),
    headers: {
      'content-type': getType(path) || 'application/octet-stream',
      'content-length': lstatSync(path).size,
    },
    file: readFileSync(path),
  };
}

/**
 * Uploads an asset to a release
 * @param {string} url - upload url for the release
 * @param {Asset} asset - the Asset object representing the release artifact
 * @return {Promise<Response<ReposUploadReleaseAssetResponse>>}
 */
async function uploadAsset(url: string, asset: Asset): Promise<Response<ReposUploadReleaseAssetResponse>> {
  return github.repos.uploadReleaseAsset(
      Object.assign({url}, asset)
  );
}
