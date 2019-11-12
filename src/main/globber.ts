import { GlobSync } from 'glob';

export interface Globber {
  glob(pattern: string): string[]
}

/**
 * FileGlobber implements Globber
 */
export class FileGlobber implements Globber {
  /**
   * Expands a glob pattern into a list of files
   * @param {string} pattern
   * @return {string[]}
   */
  glob(pattern: string): string[] {
    return new GlobSync(pattern, { mark: true }).found;
  }
}
