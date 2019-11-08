import { basename } from 'path';
import { readFileSync, statSync } from 'fs';
import { getType } from 'mime';

/**
 * Artifact represents a file on disk
 */
export class Artifact {
  readonly name: string;

  /**
   * Artifact takes the path of the file on disk
   * @param {string} path - the path to the file
   */
  constructor(
    readonly path: string,
  ) {
    this.name = basename(path);
  }

  /**
   * The size of the file in bytes
   * @return {number}
   */
  get contentLength(): number {
    return statSync(this.path).size;
  }

  /**
   * Returns the type of file or catch all application/octet-stream
   * @return {string}
   */
  get contentType(): string {
    return getType(this.path) || 'application/octet-stream';
  }

  /**
   * Reads the file into memory
   * @return {Buffer}
   */
  readFile(): Buffer {
    return readFileSync(this.path);
  }
}
