"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
/**
 * FileGlobber implements Globber
 */
class FileGlobber {
    /**
     * Expands a glob pattern into a list of files
     * @param {string} pattern
     * @return {string[]}
     */
    glob(pattern) {
        return new glob_1.GlobSync(pattern, { mark: true }).found;
    }
}
exports.FileGlobber = FileGlobber;
