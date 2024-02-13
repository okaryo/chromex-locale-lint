#!/usr/bin/env node

import fs from "fs";
import path from "path";
import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

type Messages = {
	[key: string]: {
		message: string;
		description?: string;
		placeholders?: {
			[key: string]: {
				content: string;
				example?: string;
			};
		};
	};
};

const supportedLocales = [
	"ar",
	"am",
	"bg",
	"bn",
	"ca",
	"cs",
	"da",
	"de",
	"el",
	"en",
	"en_AU",
	"en_GB",
	"en_US",
	"es",
	"es_419",
	"et",
	"fa",
	"fi",
	"fil",
	"fr",
	"gu",
	"he",
	"hi",
	"hr",
	"hu",
	"id",
	"it",
	"ja",
	"kn",
	"ko",
	"lt",
	"lv",
	"ml",
	"mr",
	"ms",
	"nl",
	"no",
	"pl",
	"pt_BR",
	"pt_PT",
	"ro",
	"ru",
	"sk",
	"sl",
	"sr",
	"sv",
	"sw",
	"ta",
	"te",
	"th",
	"tr",
	"uk",
	"vi",
	"zh_CN",
	"zh_TW",
];

const argv = yargs(hideBin(process.argv))
	.option("localesDir", {
		alias: "d",
		description: "Specify the locales directory",
		default: "_locales/",
	})
	.option("baseLang", {
		alias: "l",
		description: "Specify the base language",
		default: "en",
	})
	.option("strict", {
		alias: "s",
		type: "boolean",
		description: "Treat warnings as errors",
		default: false,
	})
	.parseSync();

const logAndExitIfNeeded = (message: string, isWarning = false) => {
	if (isWarning && !argv.strict) {
		console.warn(`[${chalk.yellow("warn")}] ${message}`);
	} else {
		console.error(`[${chalk.red("error")}] ${message}`);
		process.exit(1);
	}
};

const localesDirPath = path.resolve(process.cwd(), argv.localesDir);
if (!fs.existsSync(localesDirPath)) {
	logAndExitIfNeeded(`Locales directory ${localesDirPath} does not exist.`);
}

const directories = fs.readdirSync(localesDirPath, { withFileTypes: true });
for (const directory of directories) {
	if (!supportedLocales.includes(directory.name)) {
		logAndExitIfNeeded(
			`Error: Invalid locale directory '${
				directory.name
			}' detected in '${path.join(
				localesDirPath,
				directory.name,
			)}'. Please check the locale directory name.`,
		);
	}
}

const baseLangFilePath = path.join(
	localesDirPath,
	argv.baseLang,
	"messages.json",
);
let baseLangMessages: Messages;
try {
	const rawContent = fs.readFileSync(baseLangFilePath, "utf-8");
	baseLangMessages = JSON.parse(rawContent);
} catch (err) {
	logAndExitIfNeeded(`Failed to read or parse ${baseLangFilePath}.`);
}

const localeDirs = fs
	.readdirSync(localesDirPath)
	.filter((dir) => dir !== argv.baseLang);
for (const dir of localeDirs) {
	const messagesFilePath = path.join(localesDirPath, dir, "messages.json");
	try {
		const rawContent = fs.readFileSync(messagesFilePath, "utf-8");
		const messages: Messages = JSON.parse(rawContent);
		const otherLocaleKeysSet = new Set(Object.keys(messages));

		for (const key of Object.keys(baseLangMessages!)) {
			if (!otherLocaleKeysSet.has(key)) {
				logAndExitIfNeeded(
					`Key "${key}" in base language \`${argv.baseLang}\` does not exist in \`${dir}\``,
					true,
				);
			}
		}

		for (const key of otherLocaleKeysSet) {
			if (!Object.hasOwn(baseLangMessages!, key)) {
				logAndExitIfNeeded(
					`Key "${key}" in \`${dir}\` does not exist in base language \`${argv.baseLang}\``,
				);
			}
		}
	} catch (err) {
		logAndExitIfNeeded(`Failed to read or parse ${messagesFilePath}.`);
	}
}
