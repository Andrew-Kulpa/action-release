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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = require("fs");
/**
 * Artifact Archiver takes a list of files and creates a zip archive
 * (zip and tar.gz supported)
 */
class ArtifactArchiver {
    /**
     * Takes a string specifying the format of the zip archive
     * @param {string} format
     */
    constructor(format) {
        this.format = format;
        const options = {
            gzip: (format === 'tar'),
            zlib: { level: 9 },
        };
        this.archiver = archiver_1.default(format, options);
    }
    /**
     * Compresses a list of artifacts into a zipfile with name {outputFile}
     * @param {Artifact[]} artifacts
     * @param {string} outputFile
     * @return {Promise<void>}
     */
    compressArtifacts(artifacts, outputFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const output = fs_1.createWriteStream(outputFile);
                this.archiver.pipe(output);
                artifacts.forEach((artifact) => {
                    this.archiver.file(artifact.path, {});
                });
                yield this.archiver.finalize();
            }
            catch (error) {
                throw new Error(`Failed to archive files: ${error.message}`);
            }
        });
    }
}
exports.ArtifactArchiver = ArtifactArchiver;
