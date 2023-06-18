#!/usr/bin/env node

import chalk from "chalk";
import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

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
  "en_GB",
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
  "nb",
  "nl",
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
  .parseSync();

// Check if the locales directory exists
const localesDirPath = path.resolve(process.cwd(), argv.localesDir);
if (!fs.existsSync(localesDirPath)) {
  console.error(`Locales directory ${localesDirPath} does not exist.`);
  process.exit(1);
}

// Check if the directory names are valid supported locale names
const directories = fs.readdirSync(localesDirPath, { withFileTypes: true });
for (const directory of directories) {
  if (!supportedLocales.includes(directory.name)) {
    console.error(
      `Error: Invalid locale directory '${
        directory.name
      }' detected in '${path.join(
        localesDirPath,
        directory.name
      )}'. Please check the locale directory name.`
    );
  }
}

// Read the base language messages.json file
const baseLangFilePath = path.join(
  localesDirPath,
  argv.baseLang,
  "messages.json"
);
let baseLangMessages: any;
try {
  const rawContent = fs.readFileSync(baseLangFilePath, "utf-8");
  baseLangMessages = JSON.parse(rawContent);
} catch (err) {
  console.error(
    `[${chalk.red("error")}] Failed to read or parse ${baseLangFilePath}.`
  );
  process.exit(1);
}

// Read the messages.json files of other locales
const localeDirs = fs.readdirSync(localesDirPath);
const otherLocalesMessages = localeDirs
  .filter((dir) => dir !== argv.baseLang)
  .map((dir) => {
    const messagesFilePath = path.join(localesDirPath, dir, "messages.json");
    try {
      const rawContent = fs.readFileSync(messagesFilePath, "utf-8");
      const messages = JSON.parse(rawContent);
      return { locale: dir, messages };
    } catch (err) {
      console.error(
        `[${chalk.red("error")}] Failed to read or parse ${messagesFilePath}.`
      );
      process.exit(1);
    }
  });

// Compare the keys of the base language and other locales
let hasErrors = false;
const baseLanguage = argv.baseLang;
const baseLocaleKeysSet = new Set(Object.keys(baseLangMessages));
for (const { locale, messages } of otherLocalesMessages) {
  const otherLocaleKeysSet = new Set(Object.keys(messages));

  for (const key of baseLocaleKeysSet) {
    if (!otherLocaleKeysSet.has(key)) {
      console.warn(
        `[${chalk.yellow(
          "warn"
        )}] Key "${key}" in base language \`${baseLanguage}\` does not exist in \`${locale}\``
      );
    }
  }

  for (const key of otherLocaleKeysSet) {
    if (!baseLocaleKeysSet.has(key)) {
      console.error(
        `[${chalk.red(
          "error"
        )}] Key "${key}" in \`${locale}\` does not exist in base language \`${baseLanguage}\``
      );
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  process.exit(1);
}
