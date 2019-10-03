import { GitHub, context } from '@actions/github'
import { setFailed, getInput } from '@actions/core'
import { Asset } from './asset'
import { basename } from 'path'
import { getType } from 'mime'
import { lstatSync, readFileSync } from 'fs'
import { ReposCreateReleaseResponse, Response, ReposGetReleaseByTagResponse } from '@octokit/rest'


const github = new GitHub(process.env.GITHUB_TOKEN!);
run();

async function run(): Promise<void> {
  try {
    await deleteOldRelease();

    const release = await createGithubRelease();
    if(getInput('overwrite') == 'true'){
      deleteOldRelease( );
    }
    uploadAssets(release.data.upload_url);

    console.log(`Release uploaded to ${release.data.html_url}`);
  } catch (error) {
    console.log(error);
    setFailed(error.message);
  }
}

function uploadAssets(upload_url: string){
  let assets = getInput('files').split("\n");
  assets = assets ? assets : [getInput('file')];
  if(assets){
    for(let asset of assets){
      uploadAsset(upload_url,getAsset(asset));
    }
  }
}

async function deleteOldRelease(): Promise<void> {
  if(getInput('overwrite') != 'true'){
    return;
  }
  const release = await github.repos.getReleaseByTag({
    ...context.repo,
    tag: getTag()
  });
  await deleteRelease(release);
  await deleteRef();
}

// delete release
async function deleteRelease(release:Response<ReposGetReleaseByTagResponse>){
  try{
    github.repos.deleteRelease({
      ...context.repo,
      release_id: release.data.id
    })
  } catch(error){
    if( error.status == 404){
       // ignore if the release wasnt found
    } else {
      throw error;
    }
  }
}

// delete referene
async function deleteRef(){
  try{
    await github.git.deleteRef({
      ...context.repo,
      ref: `tags/${getTag()}`
    });
  }
    catch(error){
      if( error.status == 404){
        // ignore if the ref wasnt found
     } else {
       throw error;
     }
    }
}

function getTag(): string{
  let tag = '';
  if(getInput('tag')){
    tag = getInput('tag');
  } else if (getInput('name')){
    tag = getInput('name')
  } else if (process.env.GITHUB_REF!.startsWith('refs/tags/')) {
    tag = process.env.GITHUB_REF!.split('/')[2];
  } else {
    throw new Error('A tag is required for GitHub Releases, please set via the tag / name inputs or tagging the Github reference');
  }
  return tag;
}

function getName(): string {
  return getInput('name') || getTag();
}

function getReleaseBody(): string {
  const bodyFilePath = getInput('bodyFile');
  let body = bodyFilePath ? bodyFilePath : getInput('body');
  return body;
}

async function createGithubRelease(): Promise<Response<ReposCreateReleaseResponse>> {
  const response = await github.repos.createRelease({
    ...context.repo,
    tag_name: getName(),
    name: getTag(),
    body: getReleaseBody(),
    draft: getInput('draft') == 'true',
    prerelease: getInput('prerelease') == 'true',
  })
  return response
}

function getAsset(path: string): Asset {
  return {
    name: basename(path),
    mime: getType(path) || 'application/octet-stream',
    size: lstatSync(path).size,
    file: readFileSync(path)
  }
}

async function uploadAsset(url: string, asset: Asset): Promise<Response<any>> {
  return github.repos.uploadReleaseAsset({
    url,
    headers: {
      'content-length': asset.size,
      'content-type': asset.mime
    },
    name: asset.name,
    file: asset.file
  })
}
