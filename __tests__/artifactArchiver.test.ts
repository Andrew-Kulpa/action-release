import { ArtifactArchiver } from '../src/main/artifactArchiver';
import { Artifact } from '../src/main/artifact';
import fs from 'fs';
import os from 'os';
import rimraf from 'rimraf';
import { promisify } from 'util';


const TMP_PATH = `${os.tmpdir()}/action-release`;

const MOCK_ARTIFACTS = [
  new Artifact(`${TMP_PATH}/dist/assets/asset1.jpg`),
  new Artifact(`${TMP_PATH}/dist/assets/asset2.png`),
  new Artifact(`${TMP_PATH}/dist/somefile.js`),
  new Artifact(`${TMP_PATH}/dist/index.html`),
  new Artifact(`${TMP_PATH}/dist/RELEASE.md`),
];

describe('ArtifactArchiver', () => {
  beforeEach(() => {
    fs.mkdirSync(`${TMP_PATH}/dist/assets`, { recursive: true });
    MOCK_ARTIFACTS.forEach(({ path }) => {
      fs.writeFileSync(path, 'some file content');
    });
  });

  it('creates tar.gz file', async () => {
    const archiver = new ArtifactArchiver('tar');
    await archiver.compressArtifacts(MOCK_ARTIFACTS, `${TMP_PATH}/dist/dist.tar.gz`);
    expect(fs.existsSync(`${TMP_PATH}/dist/dist.tar.gz`)).toBeTruthy();
  });

  it('creates zip file', async () => {
    const archiver = new ArtifactArchiver('zip');
    await archiver.compressArtifacts(MOCK_ARTIFACTS, `${TMP_PATH}/dist/dist.zip`);
    expect(fs.existsSync(`${TMP_PATH}/dist/dist.zip`)).toBeTruthy();
  });

  afterEach(() => {
    // https://github.com/ipfs/js-ipfs/pull/2243
    // > rimraf.sync does not retry when it encounters errors on windows. 
    // > The async version retries a number of times before failing.
    return promisify(rimraf)(`${TMP_PATH}`);
  });
});
