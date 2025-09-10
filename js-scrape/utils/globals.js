import chalk from "chalk";
import fs from "fs";
import path from "path";
import { BATCH_SIZE } from "./constants.js";
import axios from "axios";
import { bodyOnly } from "../scraping/cheerio.js";

let startAt = 0;
let endAt = BATCH_SIZE;


export function extractUrl(filename) {
    const data = fs.readFileSync(filename, 'utf-8');
    return data.trim();
}

export function getFilesinDir(dirPath) {
  try {
    const fileNames = fs.readdirSync(dirPath);
    const files = fileNames.filter(file =>
      fs.statSync(path.join(dirPath, file)).isFile()
    );
    return files;
  } catch (err) {
    console.error("Error reading directory:", err);
    return [];
  }
}

export function getNextBatch(jsonData) {
    const batch = jsonData.slice(startAt, endAt);
    startAt += BATCH_SIZE;
    endAt += BATCH_SIZE;

    return batch;
}


export async function fetchHtml(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const body = bodyOnly(response.data);
        if (!body) {
            throw new Error("No body content found");
        }
        return body;
    } catch (error) {
        console.error("Error fetching HTML:", error);
        throw error;
    }
}