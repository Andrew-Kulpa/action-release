"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const fs_1 = require("fs");
const TAR_OPTIONS = ['tar', 'gz', 'tgz', 'tar.gz'];
/**
 * ActionInputs implements the Inputs interface
 */
class ActionInputs {
    /**
     * Action inputs takes an artifact globber and the current GitHub context
     * @param {ArtifactGlobber} artifactGlobber
     * @param {Context} context
     */
    constructor(artifactGlobber, context) {
        this.artifactGlobber = artifactGlobber;
        this.context = context;
    }
    /**
     * Returns a list of artifacts
     * @return {Artifact[]}
     */
    get files() {
        const files = core_1.getInput('files') || core_1.getInput('file');
        return (files) ? this.artifactGlobber.globArtifactString(files) : [];
    }
    /**
     * Returns the body of the release (either from a file or directly specified)
     * @return {string}
     */
    get body() {
        const bodyFilePath = core_1.getInput('bodyFile');
        return bodyFilePath ? this.stringFromFile(bodyFilePath) : core_1.getInput('body');
    }
    /**
     * Returns the output file name
     * @return {string}
     */
    get outputName() {
        return `/${core_1.getInput('output') || this.name}${this.extension}`;
    }
    /**
     * Returns the type of compression to use (zip, gzip, or none)
     * @return {string}
     */
    get type() {
        const format = core_1.getInput('archiveType');
        if (TAR_OPTIONS.includes(format)) {
            return 'tar';
        }
        if (!format || format === 'zip') {
            return format;
        }
        core_1.warning(`Unsupported format ${format}. Failing back to default.`);
        return '';
    }
    /**
     * Returns the name of the release (defaults to the name of the tag)
     * @return {string}
     */
    get name() {
        return core_1.getInput('name') || this.tag;
    }
    /**
     * Returns whether the release should be marked as a draft
     * @return {boolean}
     */
    get draft() {
        return core_1.getInput('draft') === 'true';
    }
    /**
     * Returns whether to overwrite an existing release
     * @return {boolean}
     */
    get overwrite() {
        return core_1.getInput('overwrite') === 'true';
    }
    /**
     * Returns whether the release is a prerelease
     * @return {boolean}
     */
    get prerelease() {
        return core_1.getInput('prerelease') === 'true';
    }
    /**
     * Returns the commit sha
     * @return {string}
     */
    get commit() {
        return this.context.sha;
    }
    /**
     * Returns the release tag (defaults to ref tag)
     * @return {string}
     */
    get tag() {
        const tag = core_1.getInput('tag');
        if (tag) {
            return tag;
        }
        const ref = this.context.ref;
        const tagPath = 'refs/tags/';
        if (ref && ref.startsWith(tagPath)) {
            return ref.substr(tagPath.length, ref.length);
        }
        throw new Error('No tag found in ref or input!');
    }
    /**
     * Returns the specified GitHub API token
     * @return {string}
     */
    get token() {
        return core_1.getInput('token', { required: true });
    }
    /**
     * Returns the extension of the output file (based on compression type)
     * @return {string}
     */
    get extension() {
        const type = this.type;
        if (!type) {
            return '';
        }
        return (type === 'tar') ? `.${type}.gz` : `.${type}`;
    }
    /**
     * Given a path, reads in the contents of a file into a string
     * @param {string} path
     * @return {string}
     */
    stringFromFile(path) {
        return fs_1.readFileSync(path, 'utf-8');
    }
}
exports.ActionInputs = ActionInputs;
