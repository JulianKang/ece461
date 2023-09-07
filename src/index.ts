#!/usr/bin/env node
// src/index.ts
import { execSync } from 'child_process';
import { Command } from 'commander';

const program = new Command();

/* program
  .version('1.0.0')
  .description('My CLI Tool')
  .option('-n, --name <name>', 'Your name')
  .action((options) => {
    if (options.name) {
      console.log(`Hello, ${options.name}!`);
    } else {
      console.log('Hello, World!');
    }
  }); */

program
  .version('1.0.0')
  .description('My TypeScript CLI');

program
  .command('install')
  .description('Install packages')
  .action(() => {
    console.log('Installing packages...');
    // Your install logic here
    try {
        execSync(`npm install`, { stdio: 'inherit' });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error installing packages: ${error.message}`);
        } else {
            console.error('An unknown error occurred during package installation.');
        }
        process.exit(1);
    }
  });

program
  .command('<URL_FILE>')
  .description('Process a URL file')
  .action((urlFile) => {
    console.log(`Processing URL file: ${urlFile}`);
    // Your URL file processing logic here
  });

program
  .command('test')
  .description('Run tests')
  .action(() => {
    console.log('Running tests...');
    // Your test logic here
  });

program.parse(process.argv);
