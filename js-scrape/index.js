import fs from 'fs';
import chalk from 'chalk';
import { extractUrl, fetchHtml, getFilesinDir, getNextBatch } from './utils/globals.js';
import getProductData from './scraping/cheerio.js';
import { getProductDatawithPuppeteer } from './scraping/puppeter.js';

console.time(chalk.blue("Total script time"));

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

const newLoc = new URL(batch[0].loc);
console.log(chalk.green("Processing URL:", chalk.yellowBright(newLoc.href)));

// let html;
// try {
//     html = fs.readFileSync(`./data/htmlData/${newLoc.pathname}.html`, 'utf-8');
//     console.log(chalk.green("Read HTML from file for id:", chalk.yellowBright(newLoc.pathname)));
// } catch (error) {
//     console.log(chalk.red("HTML file not found for id:", chalk.yellowBright(newLoc.pathname), "Fetching from web..."));
// }

// if (!html) {
//     html = await fetchHtml(newLoc.href);
//     // write
//     try {
//         fs.writeFileSync(`./data/htmlData/${newLoc.pathname}.html`, html);
//     } catch (error) {
//         console.error(chalk.red("Error writing HTML file:", error));
//     }
// }

const productData = await getProductDatawithPuppeteer(newLoc.href);
console.log(productData);

// console.log(batch[0]);

console.timeEnd(chalk.blue("Total script time"));