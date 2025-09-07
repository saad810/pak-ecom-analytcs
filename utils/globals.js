import chalk from "chalk";
import fs from "fs";
import path from "path";
import { BATCH_SIZE } from "./constants.js";

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
