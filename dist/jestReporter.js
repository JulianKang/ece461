const { readFile } = require('fs');
const { join } = require('path');

// Gitlab Regex: Total Coverage: (\d+.\d+ %)
module.exports = class CoverageReporter {
  constructor(globalConfig) {
    this.globalConfig = globalConfig;
    this.jsonSummary = join(this.globalConfig.coverageDirectory, 'coverage-summary.json');
  }
  async onRunComplete(contexts, results) {
    const totalTests = results.numTotalTests;
    const passedTests = results.numPassedTests;
  
    const coverage = require(this.jsonSummary);
    const totalSum = ['lines']
      .map(i => coverage.total[i].pct)
      .reduce((a, b) => a + b, 0)
    const avgCoverage = totalSum

    // console.log(`Total: ${totalTests}`);
    // console.log(`Passed: ${passedTests}`);
    // console.log(`Coverage: ${avgCoverage.toFixed(2)} %`)
    console.log(`${passedTests}/${totalTests} test cases passed. ${avgCoverage.toFixed(2)}% line coverage achieved.`);
  } 
}