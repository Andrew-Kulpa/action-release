"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("@actions/github");
const core_1 = require("@actions/core");
const path_1 = require("path");
const mime_1 = require("mime");
const fs_1 = require("fs");
const github = new github_1.GitHub(process.env.GITHUB_TOKEN);
run();
/**
 * Run the action
 * @return {void}
 */
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield deleteOldRelease();
            if (core_1.getInput('overwrite') == 'true') {
                deleteOldRelease();
            }
            const release = yield createGithubRelease();
            uploadAssets(release.data.upload_url);
            console.log(`Release uploaded to ${release.data.html_url}`);
        }
        catch (error) {
            console.log(error);
            core_1.setFailed(error.message);
        }
    });
}
/**
 * Uploads all linked assets to a release
 * @param {string} uploadUrl - upload url for the release
 * @return {void}
 */
function uploadAssets(uploadUrl) {
    let assets = core_1.getInput('files').split('\n');
    assets = assets ? assets : [core_1.getInput('file')];
    console.log(`Uploading assets to ${uploadUrl}:`);
    console.log(assets);
    for (const asset of assets) {
        if (asset) {
            uploadAsset(uploadUrl, getAsset(asset));
        }
    }
}
/**
 * Deletes any matching release and reference
 * @return {Promise<void>}
 */
function deleteOldRelease() {
    return __awaiter(this, void 0, void 0, function* () {
        if (core_1.getInput('overwrite') != 'true') {
            return;
        }
        let release;
        try {
            release = yield github.repos.getReleaseByTag(Object.assign(Object.assign({}, github_1.context.repo), { tag: getTag() }));
        }
        catch (error) {
            if (error.status == 404) {
                // ignore if the release wasnt found
                return;
            }
            else {
                throw error;
            }
        }
        yield deleteRelease(release);
        yield deleteRef();
    });
}
/**
 * Deletes a matching release
 * @param {Release<ReposGetReleaseByTagResponse>} release - release reference
 * @return {Promise<void>}
 */
function deleteRelease(release) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            github.repos.deleteRelease(Object.assign(Object.assign({}, github_1.context.repo), { release_id: release.data.id }));
        }
        catch (error) {
            if (error.status == 404) {
                // ignore if the release wasnt found
            }
            else {
                throw error;
            }
        }
    });
}
/**
 * Deletes a matching reference
 * @return {Promise<void>}
 */
function deleteRef() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield github.git.deleteRef(Object.assign(Object.assign({}, github_1.context.repo), { ref: `tags/${getTag()}` }));
        }
        catch (error) {
            if (error.status == 404) {
                // ignore if the ref wasnt found
            }
            else {
                throw error;
            }
        }
    });
}
/**
 * Resolves the release tag
 * @return {string}
 */
function getTag() {
    let tag = '';
    if (core_1.getInput('tag')) {
        tag = core_1.getInput('tag');
    }
    else if (core_1.getInput('name')) {
        tag = core_1.getInput('name');
    }
    else if (process.env.GITHUB_REF.startsWith('refs/tags/')) {
        tag = process.env.GITHUB_REF.split('/')[2];
    }
    else {
        throw new Error('A tag is required for GitHub Releases, ' +
            'please set via the tag / name inputs or tagging the Github reference');
    }
    return tag;
}
/**
 * Resolves the release name
 * @return {string}
 */
function getName() {
    return core_1.getInput('name') || getTag();
}
/**
 * Resolves the release body
 * @return {string}
 */
function getReleaseBody() {
    const bodyFilePath = core_1.getInput('bodyFile');
    const body = bodyFilePath ? bodyFilePath : core_1.getInput('body');
    return body;
}
/**
 * Create a release
 * @return {Promise<ReposCreateReleaseResponse>}
 */
function createGithubRelease() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield github.repos.createRelease(Object.assign(Object.assign({}, github_1.context.repo), { tag_name: getName(), name: getTag(), body: getReleaseBody(), target_commitish: github_1.context.sha, draft: core_1.getInput('draft') == 'true', prerelease: core_1.getInput('prerelease') == 'true' }));
        return response;
    });
}
/**
 * Returns an Asset object from a retrieved file
 * @param {string} path - path to local file
 * @return {Asset}
 */
function getAsset(path) {
    return {
        name: path_1.basename(path),
        headers: {
            'content-type': mime_1.getType(path) || 'application/octet-stream',
            'content-length': fs_1.lstatSync(path).size,
        },
        file: fs_1.readFileSync(path),
    };
}
/**
 * Uploads an asset to a release
 * @param {string} url - upload url for the release
 * @param {Asset} asset - the Asset object representing the release artifact
 * @return {Promise<Response<ReposUploadReleaseAssetResponse>>}
 */
function uploadAsset(url, asset) {
    return __awaiter(this, void 0, void 0, function* () {
        return github.repos.uploadReleaseAsset(Object.assign({ url }, asset));
    });
}
