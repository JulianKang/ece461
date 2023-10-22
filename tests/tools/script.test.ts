import {metricEvaluation} from '../../src/tools/metriceval';
import {beginEvaluation} from '../../src/tools/script';
import {describe, test, expect, beforeAll, jest} from '@jest/globals';
import logger from '../../src/logger';
import * as dotenv from 'dotenv'


// globals
const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];

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

describe('script', () => {
    test(`Evaluate URLS`, async () => {
        const metric_spy = jest.spyOn(metricEvaluation.prototype, 'logAll');
        await beginEvaluation(urls, token);
        expect(metric_spy).toBeCalledTimes(5);
        metric_spy.mockRestore();
    });
});