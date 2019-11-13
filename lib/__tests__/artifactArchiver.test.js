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
const artifactArchiver_1 = require("../src/main/artifactArchiver");
const artifact_1 = require("../src/main/artifact");
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const rimraf_1 = __importDefault(require("rimraf"));
const util_1 = require("util");
const TMP_PATH = `${os_1.default.tmpdir()}/action-release`;
const MOCK_ARTIFACTS = [
    new artifact_1.Artifact(`${TMP_PATH}/dist/assets/asset1.jpg`),
    new artifact_1.Artifact(`${TMP_PATH}/dist/assets/asset2.png`),
    new artifact_1.Artifact(`${TMP_PATH}/dist/somefile.js`),
    new artifact_1.Artifact(`${TMP_PATH}/dist/index.html`),
    new artifact_1.Artifact(`${TMP_PATH}/dist/RELEASE.md`),
];
describe('ArtifactArchiver', () => {
    beforeEach(() => {
        fs_1.default.mkdirSync(`${TMP_PATH}/dist/assets`, { recursive: true });
        MOCK_ARTIFACTS.forEach(({ path }) => {
            fs_1.default.writeFileSync(path, 'some file content');
        });
    });
    it('creates tar.gz file', () => __awaiter(void 0, void 0, void 0, function* () {
        const archiver = new artifactArchiver_1.ArtifactArchiver('tar');
        yield archiver.compressArtifacts(MOCK_ARTIFACTS, `${TMP_PATH}/dist/dist.tar.gz`);
        expect(fs_1.default.existsSync(`${TMP_PATH}/dist/dist.tar.gz`)).toBeTruthy();
    }));
    it('creates zip file', () => __awaiter(void 0, void 0, void 0, function* () {
        const archiver = new artifactArchiver_1.ArtifactArchiver('zip');
        yield archiver.compressArtifacts(MOCK_ARTIFACTS, `${TMP_PATH}/dist/dist.zip`);
        expect(fs_1.default.existsSync(`${TMP_PATH}/dist/dist.zip`)).toBeTruthy();
    }));
    afterEach(() => {
        // https://github.com/ipfs/js-ipfs/pull/2243
        // > rimraf.sync does not retry when it encounters errors on windows. 
        // > The async version retries a number of times before failing.
        return util_1.promisify(rimraf_1.default)(`${TMP_PATH}`);
    });
});
