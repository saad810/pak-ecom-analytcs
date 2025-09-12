import fs from 'fs';
import chalk from 'chalk';
import { extractUrl, fetchHtml, getFilesinDir, getNextBatch } from './utils/globals.js';
import getProductData from './scraping/cheerio.js';
import { getProductDatawithPuppeteer } from './scraping/puppeter.js';
import { url } from 'inspector';

console.time(chalk.blue("Total script time"));

// import fetchAndExtract from './utils/fetchAndExtract.js';
// import { URLS_TO_PROCESS_PATH} from './utils/constants.js';


// const url = new URL(extractUrl(URLS_TO_PROCESS_PATH));
// fetchAndExtract(url)
//     .then(data => console.log(chalk.blue("processed", chalk.yellowBright(data)))) // first 500 chars
//     .catch(err => console.error(chalk.red(err)));


const files = getFilesinDir('./data/jsonData/');
console.log(chalk.blue("Files in jsonData dir:", files.length, files));

const data = fs.readFileSync(`./data/jsonData/${files[0]}`, 'utf-8');
const batch = getNextBatch(JSON.parse(data));
console.log(chalk.cyan("Batch-1", chalk.yellowBright(batch.length)));

let productData = [];
let timeData = [];
let retryList = [];
let successCount = 0;
let failCount = 0;
let totalProcessed = 0;


for (let data of batch) {
    const iterationStart = Date.now();
    const newLoc = new URL(data?.loc);
    console.log(chalk.green("Processing URL:", chalk.yellowBright(totalProcessed + 1), chalk.blue(newLoc.href)));

    try {
        const prodData = await getProductDatawithPuppeteer(newLoc.href);
        if (prodData) {
            successCount++;
        } else {
            failCount++;
            retryList.push({ url: newLoc.href, error: "No product data found" });
            continue;

        }
        productData.push({ url: newLoc.href, ...prodData });

    } catch (error) {
        console.error(chalk.red("Error processing URL:"), newLoc.href, error);
        retryList.push({ url: newLoc.href, error: error.message });
        failCount++;
        continue;
    }
    const totalTime = ((Date.now() - iterationStart) / 1000).toFixed(2);

    console.log(chalk.blue("Iteration time:"), totalTime, "seconds");
    timeData.push({
        url: newLoc.href,
        timeTaken: totalTime
    })


    if (totalProcessed === 10) {
        
        // if (!fs.existsSync(`./data/processed/products_batch_1.json`)) {
        //     fs.writeFileSync(`./data/processed/products_batch_1.json`, '');
        // }
        // if (!fs.existsSync(`./data/processed/time_batch_1.json`)) {
        //     fs.writeFileSync(`./data/processed/time_batch_1.json`, '');
        // }
        // if (!fs.existsSync(`./data/processed/retry_batch_1.json`)) {
        //     fs.writeFileSync(`./data/processed/retry_batch_1.json`, '');
        // }
        fs.appendFileSync(`./data/processed/products_batch_1.json`, JSON.stringify(productData, null, 2));
        fs.appendFileSync(`./data/processed/time_batch_1.json`, JSON.stringify(timeData, null, 2));
        fs.appendFileSync(`./data/processed/retry_batch_1.json`, JSON.stringify(retryList, null, 2));
        productData = [];
        timeData = [];
        retryList = [];
        totalProcessed = 0;
        console.log(chalk.magenta("Written 10 items to file. Total processed:", totalProcessed));
    }

    totalProcessed++;

}

// for every 10 items, write to file

