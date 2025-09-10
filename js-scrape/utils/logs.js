import fs from "fs";
import chalk from "chalk";
import { LOGS_DIR } from "./constants.js";

export async function createLogs(
    logType, url, timeStamp, status, operation, details, tools
) {
    const logEntry = {
        logType,
        url,
        timeStamp,
        status,
        operation,
        details,
        tools
    };

    const logFilePath = `${LOGS_DIR}globals.log`;
    fs.appendFile(logFilePath, JSON.stringify(logEntry) + '\n', (err) => {
        if (err) {
            console.error(chalk.red("Error writing log:", err));
        } else {
            console.log(chalk.green("Log created:", logFilePath));
        }
    });
}
