import axios from 'axios';
import fs from 'fs';
import { parseStringPromise } from "xml2js";
import { JSON_DATA_DIR, XML_DATA_DIR } from './constants.js';
export default async function fetchAndExtract(url) {
    try {
        // Download as arraybuffer
        const response = await axios.get(url.href);
        try {
            fs.writeFileSync(`${XML_DATA_DIR}/${url.pathname?.slice(1, -3)}`, response.data);
            console.log("File written successfully");
        } catch (error) {
            console.error("File write error:", error);
        }

        // convert to xml to js
        const result = await parseStringPromise(response.data);
        // console.log(result);

        const urls = result.urlset.url.map(
            urlObj => ({
                loc: urlObj.loc[0],
                lastmod: urlObj.lastmod ? urlObj.lastmod[0] : null,
                changefreq: urlObj.changefreq ? urlObj.changefreq[0] : null,
                priority: urlObj.priority ? urlObj.priority[0] : null,
            })
        );
        console.log("TOTAL urls", urls.length); // total urls

        fs.writeFileSync(`${JSON_DATA_DIR}/${url.pathname?.slice(1, -7)}.json`, JSON.stringify(urls, null, 2));
        console.log("XML to JS conversion successful");
        return urls.length;

    } catch (err) {
        console.error("Decompression error:", err);
        throw err;
    }
}
