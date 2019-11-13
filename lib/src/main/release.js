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
const core_1 = require("@actions/core");
/**
 * GitHubRelease implements the Release interface.
 */
class GitHubRelease {
    /**
     * GitHubRelease takes the current GitHub Actions context as well
     * as an instance of '@actions/github'
     * @param {Context} context
     * @param {GitHub} git
     */
    constructor(context, git) {
        this.context = context;
        this.git = git;
    }
    /**
     * Create a release
     * @param {ReleaseOptions} options
     * @return {Promise<ReposCreateReleaseResponse>}
     */
    create(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.git.repos.createRelease(Object.assign(Object.assign({}, this.context.repo), options));
            return response;
        });
    }
    /**
     * Uploads an asset to a release
     * @param {UploadOptions} options - the Asset object representing the release artifact
     * @return {Promise<Response<ReposUploadReleaseAssetResponse>>}
     */
    uploadAsset(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git.repos.uploadReleaseAsset(Object.assign({}, options));
        });
    }
    /**
     * Deletes any matching release and reference
     * @param {string} tag
     * @return {Promise<void>}
     */
    deleteByTag(tag) {
        return __awaiter(this, void 0, void 0, function* () {
            let release;
            try {
                release = yield this.git.repos.getReleaseByTag(Object.assign(Object.assign({}, this.context.repo), { tag }));
            }
            catch (error) {
                if (error.status === 404) {
                    core_1.info(`Release with tag ${tag} was not found`);
                    return;
                }
                else {
                    throw new Error(`Failed to delete matching release: ${error.message}`);
                }
            }
            yield this.delete(release);
            yield this.deleteRef(tag);
        });
    }
    /**
     * Deletes a matching release
     * @param {Response<ReposGetReleaseByTagResponse>} release
     * @return {Promise<void>}
     */
    delete(release) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.git.repos.deleteRelease(Object.assign(Object.assign({}, this.context.repo), { release_id: release.data.id }));
        });
    }
    /**
     * Deletes a matching reference
     * @param {string} ref
     * @return {Promise<void>}
     */
    deleteRef(ref) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.git.git.deleteRef(Object.assign(Object.assign({}, this.context.repo), { ref: `tags/${ref}` }));
        });
    }
}
exports.GitHubRelease = GitHubRelease;
