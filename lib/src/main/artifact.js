"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const mime_1 = require("mime");
/**
 * Artifact represents a file on disk
 */
class Artifact {
    /**
     * Artifact takes the path of the file on disk
     * @param {string} path - the path to the file
     */
    constructor(path) {
        this.path = path;
        this.name = path_1.basename(path);
    }
    /**
     * The size of the file in bytes
     * @return {number}
     */
    get contentLength() {
        return fs_1.statSync(this.path).size;
    }
    /**
     * Returns the type of file or catch all application/octet-stream
     * @return {string}
     */
    get contentType() {
        return mime_1.getType(this.path) || 'application/octet-stream';
    }
    /**
     * Reads the file into memory
     * @return {Buffer}
     */
    readFile() {
        return fs_1.readFileSync(this.path);
    }
}
exports.Artifact = Artifact;
