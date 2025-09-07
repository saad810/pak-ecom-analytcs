import fs from 'fs';
import fetchAndExtract from './utils/fetchAndExtract.js';
import { URLS_TO_PROCESS_PATH } from './utils/constants.js';
import chalk from 'chalk';
import { extractUrl } from './utils/globals.js';


const url = new URL(extractUrl(URLS_TO_PROCESS_PATH));

// const url = new URL("https://www.daraz.pk/sitemap-product-all-311.xml.gz");

fetchAndExtract(url)
    .then(data => console.log(chalk.blue("processed", chalk.yellowBright(data)))) // first 500 chars
    .catch(err => console.error(chalk.red(err)));
