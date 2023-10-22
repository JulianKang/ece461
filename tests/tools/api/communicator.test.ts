import {repoCommunicator, repoConnection} from '../../../src/tools/api';
import {describe, test, expect, beforeAll} from '@jest/globals';
import logger from '../../../src/logger';
import * as dotenv from 'dotenv'


// globals
const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];
const githubUrls: string[] = ['https://github.com/browserify/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://github.com/expressjs/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];

process.env.DOTENV_CONFIG_PATH = '../../../.env';
dotenv.config();
const token: string | undefined = process.env.GITHUB_TOKEN;
if (!token) {
    expect(token).toBeDefined();
    logger.error('GitHub API token not found in the .env file');
    throw new Error;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TESTING // ///////////////////////////////// TESTING // ///////////////////////////////// TESTING ///////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('communicator', () => {
    urls.forEach((url, i) => {
        let connection : repoConnection;
        let communicator : repoCommunicator;

        beforeAll(async () => {
            connection = await repoConnection.create(url, token);
            communicator = await repoCommunicator.create(connection);
        });

        test(`Communicator Initialized URL${i}`, () => {
            expect(communicator).toBeDefined();
            expect(communicator.connection).toEqual(connection);
            expect(communicator.contributors).toBeDefined();
            expect(communicator.commits).toBeDefined();
            expect(communicator.general).toBeDefined();
            expect(communicator.repositoryURL).toEqual(githubUrls[i]);
            expect(communicator.cloneDirectory).toBeDefined();
            expect(communicator.recentCommit).toBeDefined();
        });
    });
});