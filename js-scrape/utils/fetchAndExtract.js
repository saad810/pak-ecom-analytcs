import axios from 'axios';
import fs from 'fs';
import { parseStringPromise } from "xml2js";
import chalk from 'chalk';
import { JSON_DATA_DIR, XML_DATA_DIR } from './constants.js';
import { createLogs } from './logs.js';
export default async function fetchAndExtract(url) {
    try {
        // Download as arraybuffer
        const response = await axios.get(url.href);
        try {
            fs.writeFileSync(`${XML_DATA_DIR}/${url.pathname?.slice(1, -3)}`, response.data);
            createLogs(
                "info", url.href, new Date().toISOString(), "success", "download", `Downloaded and saved to ${XML_DATA_DIR}${url.pathname?.slice(1, -3)}`, ["axios", "fs"]
            )
            console.log(chalk.green("File write successful"));
        } catch (error) {
            console.error(chalk.red("File write error:"), error);
            createLogs(
                "error", url.href, new Date().toISOString(), "failure", "download", `Failed to save file to ${XML_DATA_DIR}${url.pathname?.slice(1, -3)} - ${error.message}`, ["axios", "fs"]
            )
            throw error;
        }

        // convert to xml to js
        const result = await parseStringPromise(response.data);
        if(!result.urlset || !result.urlset.url) {
            console.error(chalk.red("Invalid XML structure:"), result);
            throw new Error("Invalid XML structure: Missing urlset or url elements");
        }

        const urls = result.urlset.url.map(
            urlObj => ({
                loc: urlObj.loc[0],
                lastmod: urlObj.lastmod ? urlObj.lastmod[0] : null,
                changefreq: urlObj.changefreq ? urlObj.changefreq[0] : null,
                priority: urlObj.priority ? urlObj.priority[0] : null,
            })
        );


        try {
            fs.writeFileSync(`${JSON_DATA_DIR}/${url.pathname?.slice(1, -7)}.json`, JSON.stringify(urls, null, 2));
            createLogs(
                "info", url.href, new Date().toISOString(), "success", "save", `Saved JSON data to ${JSON_DATA_DIR}${url.pathname?.slice(1, -7)}.json`, ["fs"]
            )
        } catch (error) {
            console.error(chalk.red("File write error:"), error);
            createLogs(
                "error", url.href, new Date().toISOString(), "failure", "save", `Failed to save JSON data to ${JSON_DATA_DIR}${url.pathname?.slice(1, -7)}.json - ${error.message}`, ["fs"]
            )
            throw error;
        }
        // fs.writeFileSync(`${JSON_DATA_DIR}/${url.pathname?.slice(1, -7)}-sorted.json`, JSON.stringify(sortedData, null, 2));
        console.log(chalk.green("XML to JSON conversion successful"));
        return urls.length;

    } catch (err) {
        console.error(chalk.red("Decompression error:"), err);
        throw err;
    }
}
