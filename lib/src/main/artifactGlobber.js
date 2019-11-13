"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globber_1 = require("./globber");
const artifact_1 = require("./artifact");
/**
 * FileArtifactGlobber implements ArtifactGlobber
 */
class FileArtifactGlobber {
    /**
     * Takes an object satisfying the 'Globber' interface
     * @param {Globber} globber
     */
    constructor(globber = new globber_1.FileGlobber()) {
        this.globber = globber;
    }
    /**
     * Globs a list of paths and creates Artifacts from them
     * @param {string} artifact
     * @return {Artifact[]}
     */
    globArtifactString(artifact) {
        return artifact.split(/\r?\n/)
            .map((path) => this.globber.glob(path))
            .reduce((accumulated, current) => accumulated.concat(current))
            .map((path) => new artifact_1.Artifact(path));
    }
}
exports.FileArtifactGlobber = FileArtifactGlobber;
