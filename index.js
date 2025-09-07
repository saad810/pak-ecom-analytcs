import fs from 'fs';
import chalk from 'chalk';
import { extractUrl, getFilesinDir, getNextBatch } from './utils/globals.js';
// import fetchAndExtract from './utils/fetchAndExtract.js';
// import { URLS_TO_PROCESS_PATH} from './utils/constants.js';


// const url = new URL(extractUrl(URLS_TO_PROCESS_PATH));
// fetchAndExtract(url)
//     .then(data => console.log(chalk.blue("processed", chalk.yellowBright(data)))) // first 500 chars
//     .catch(err => console.error(chalk.red(err)));


const files = getFilesinDir('./data/jsonData/');
console.log(chalk.blue("Files in jsonData dir:", files.length, files));

// read first 10 entries


const data = fs.readFileSync(`./data/jsonData/${files[0]}`, 'utf-8');
const batch = getNextBatch(JSON.parse(data));
console.log(chalk.cyan("Batch-1", chalk.yellowBright(batch.length)));


console.log(batch[0]);