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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const github = __importStar(require("@actions/github"));
const throttling = __importStar(require("@octokit/plugin-throttling"));
const core_1 = require("@actions/core");
const action_1 = require("./action");
const artifactGlobber_1 = require("./artifactGlobber");
const inputs_1 = require("./inputs");
const release_1 = require("./release");
const artifactUploader_1 = require("./artifactUploader");
/**
 * Creates a connection to GitHub which throttles requests when the
 * request quota is exhaused
 * @param {string} token
 * @return {github.GitHub}
 */
function createGitHubConnection(token) {
    github.GitHub.plugin(throttling);
    return new github.GitHub(token, {
        onRateLimit: (retryAfter, options) => {
            core_1.warning(`Request quota exhausted for request ${options.method} ${options.url}`);
            if (options.request.retryCount === 0) {
                core_1.info(`Retrying after ${retryAfter} seconds!`);
                return true;
            }
            else {
                return false;
            }
        },
        onAbuseLimit: (_retryAfter, options) => {
            core_1.warning(`Abuse detected for request ${options.method} ${options.url}`);
        },
    });
}
/**
 * Creates a GitHub Release Action
 * @return {Action}
 */
function createAction() {
    const context = github.context;
    const globber = new artifactGlobber_1.FileArtifactGlobber();
    const inputs = new inputs_1.ActionInputs(globber, context);
    const git = createGitHubConnection(inputs.token);
    const release = new release_1.GitHubRelease(context, git);
    const uploader = new artifactUploader_1.GitHubArtifactUploader(release);
    return new action_1.Action(inputs, release, uploader);
}
/**
 * Runs the GitHub Action
 * @return {void}
 */
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const action = createAction();
            yield action.run();
        }
        catch (error) {
            core_1.setFailed(error.message);
        }
    });
}
run();
