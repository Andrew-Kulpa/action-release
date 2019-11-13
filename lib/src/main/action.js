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
const artifact_1 = require("./artifact");
const artifactArchiver_1 = require("./artifactArchiver");
/**
 * Action creates GitHub release action
 */
class Action {
    /**
     * Action takes an object containing the inputs from the config file,
     * an object implementing the release interface functions,
     * and an artifact uploader which uploads a list of artifact files to GitHub actions
     * @param {Inputs} inputs
     * @param {Release} release
     * @param {ArtifactUploader} uploader
     */
    constructor(inputs, release, uploader) {
        this.inputs = inputs;
        this.release = release;
        this.uploader = uploader;
    }
    /**
     * Runs the GitHub action
     * @return {Promise<void>}
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inputs.overwrite) {
                yield this.release.deleteByTag(this.inputs.tag);
            }
            const release = yield this.release.create({
                tag_name: this.inputs.tag,
                body: this.inputs.body,
                target_commitish: this.inputs.commit,
                draft: this.inputs.draft,
                prerelease: this.inputs.prerelease,
                name: this.inputs.name,
            });
            const zipFile = () => __awaiter(this, void 0, void 0, function* () {
                const archive = new artifactArchiver_1.ArtifactArchiver(this.inputs.type);
                yield archive.compressArtifacts(this.inputs.files, __dirname + this.inputs.outputName);
                return [new artifact_1.Artifact(this.inputs.outputName)];
            });
            const files = (this.inputs.type) ? yield zipFile() : this.inputs.files;
            if (files.length > 0) {
                this.uploader.uploadArtifacts(files, release.data.upload_url);
            }
        });
    }
}
exports.Action = Action;
