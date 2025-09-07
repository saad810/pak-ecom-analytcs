import chalk from "chalk";
import fs from "fs";

export function extractUrl(filename) {
    const data = fs.readFileSync(filename, 'utf-8');
    return data.trim();
}