"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const query_registry_1 = require("query-registry");
dotenv.config({ path: '.env' });
const token = process.env.GITHUB_API_KEY;
if (!token) {
    console.error('GitHub API token not found in the .env file');
    process.exit(1); // Exit the script with an error code
}
/****************************************************************************************************************************************
 * repoConnection
 * 1. takes in url string
 * 2. Parses string to see if it is npmjs
 * 3. If so we talk to the npm with query-register to get the github repository
 * 4. Request Github Repository. This can be separated into different functions to request for issues, contributors, etc.
 * 5. I am thinking in a different class we can call all of the get issues, getcontributors, etc. So all api calls can be done and then we can just
 * request the class for the JSON formatted information.
 *
 * TODO:
 * 1. Error handling, can't access github repo, can't access npm package, etc.
 * 2. Specific requests and parsing. (e.g. getissues, getstars, etc.)
 * 3. I think we need to think of a way to minimize requests. We could create a variable to store the JSON of each request e.g. store original request repos/org/repo in a variable
 * store request from repos/org/repo/issues to another variable. etc.
 * 4. Implement a cache? store the repo data to a file and after a certain time clear this file and refill it.
 **************************************************************************************************************************************/
/* e.g. how to initialize connection
      (async () => {
      const npmrepo = new repoCommunicator(npm);

      // Wait for the initialization to complete
        await npmrepo.waitForInitialization();

        // Now that the object is initialized, you can call instance methods like getissues
        npmrepo.getissues();
      })();
*/
class repoConnection {
    constructor(url, githubkey) {
        this.initializationPromise = null;
        this.githubkey = githubkey;
        this.url = null;
        this.repo = '';
        this.org = '';
        this.initializationPromise = this.initialize(url);
    }
    async initialize(url) {
        try {
            const processedUrl = await this.processUrl(url);
            if (processedUrl) {
                const urlParts = processedUrl.split('/');
                this.org = urlParts[urlParts.length - 2];
                this.repo = urlParts[urlParts.length - 1].split('.')[0];
                this.url = processedUrl;
            }
            else {
                throw Error('Initialization failed: Github URL not Found.');
            }
        }
        catch (error) {
            throw error; // Rethrow the error to propagate it to the caller
        }
    }
    //This can be called from other functions when first initializing the class to know when initilization is complete. example code for when intializing instance
    async waitForInitialization() {
        if (!this.initializationPromise) {
            return Promise.resolve();
        }
        return this.initializationPromise;
    }
    async processUrl(url) {
        if (url.includes("npmjs")) {
            try {
                const githubRepoUrl = await this.queryNPM(npm);
                if (githubRepoUrl) {
                    console.log(`The GitHub repository for ${npm} is: ${githubRepoUrl}`);
                    return githubRepoUrl;
                }
                else {
                    return null;
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    throw error;
                }
                else {
                    throw Error(`An unknown error occurred: ${error}`);
                }
            }
        }
        else {
            return url;
        }
    }
    async queryNPM(url) {
        const urlParts = url.split('/');
        const packageName = urlParts[urlParts.length - 1].split('.')[0];
        const packageInfo = await (0, query_registry_1.getPackageManifest)({ name: packageName });
        if (packageInfo.gitRepository && packageInfo.gitRepository.url) {
            return packageInfo.gitRepository.url;
        }
        return null;
    }
    async queryGithubapi(queryendpoint) {
        try {
            const axiosInstance = axios_1.default.create({
                baseURL: 'https://api.github.com/',
                headers: {
                    Authorization: `token ${this.githubkey}`,
                    Accept: 'application/json'
                },
            });
            const endpoint = `repos/${this.org}/${this.repo}${queryendpoint}`;
            const response = await axiosInstance.get(endpoint);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
}
class repoCommunicator {
    constructor(connection) {
        this.initializationPromise = null;
        this.issues = null;
        this.contributors = null;
        this.connection = connection;
        this.initializationPromise = this.retrieveAllInfo();
    }
    async retrieveAllInfo() {
        const asyncFunctions = [
            this.getissues.bind(this),
            this.getcontributors.bind(this),
            // Add more async functions as needed
        ];
        try {
            await Promise.all(asyncFunctions.map(fn => fn()));
        }
        catch (error) {
            // Handle errors
            throw error;
        }
    }
    async compareRetrieveMethods() {
        const asyncFunctions = [
            this.getissues.bind(this),
            this.getcontributors.bind(this),
            // Add more async functions as needed
        ];
        try {
            const startUsingPromiseAll = performance.now();
            await Promise.all(asyncFunctions.map(fn => fn()));
            const endUsingPromiseAll = performance.now();
            const usingPromiseAllTime = endUsingPromiseAll - startUsingPromiseAll;
            const startUsingTraditionalAwait = performance.now();
            for (const fn of asyncFunctions) {
                await fn();
            }
            const endUsingTraditionalAwait = performance.now();
            const usingTraditionalAwaitTime = endUsingTraditionalAwait - startUsingTraditionalAwait;
            console.log(`Promise.all time: ${usingPromiseAllTime}`);
            console.log(`Traditional time: ${usingTraditionalAwaitTime}`);
        }
        catch (error) {
            // Handle errors
            throw error;
        }
    }
    async waitForInitialization() {
        if (!this.initializationPromise) {
            return Promise.resolve();
        }
        return this.initializationPromise;
    }
    async getissues() {
        try {
            const response = await this.connection.queryGithubapi('/issues');
            if (response) {
                this.issues = response.data;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async getstars() {
    }
    async getcontributors() {
        try {
            const response = await this.connection.queryGithubapi('/contributors');
            if (response) {
                this.contributors = response.data;
            }
        }
        catch (error) {
            throw error;
        }
    }
}
const npm = 'https://www.npmjs.com/package/browserify';
const github = 'https://github.com/cloudinary/cloudinary_npm';
(async () => {
    const npmrepo = new repoConnection(npm, token);
    // Wait for the initialization to complete
    await npmrepo.waitForInitialization();
    const getinfo = new repoCommunicator(npmrepo);
    await getinfo.waitForInitialization();
    //await getinfo.compareRetrieveMethods();
    //console.log(getinfo.issues)
})();
