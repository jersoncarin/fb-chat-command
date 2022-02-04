#!/usr/bin/env node

const puppeteer = require("puppeteer");
const fs = require("fs");
const chalk = require("chalk");
require("dotenv").config();

if (!process.env.FB_EMAIL || !process.env.FB_PASS) {
  throw new Error(
    "No credential provided, you should put on .env or environment variable in the system."
  );
}

const email = process.env.FB_EMAIL;
const password = process.env.FB_PASS;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    console.info(`${chalk.green("Info:")} Parsing facebook login...`);

    await page.goto("https://www.facebook.com/");

    await page.waitForSelector("#email");
    await page.type("#email", email);
    await page.type("#pass", password);
    await page.click('button[name="login"]');

    console.info(`${chalk.green("Info:")} Authenticating...`);

    await page.waitForSelector("div[role=feed]", { timeout: 8000 });

    cookies = await page.cookies();
    cookies = cookies.map(({ name: key, ...rest }) => ({ key, ...rest }));

    const cookiesString = JSON.stringify(cookies);

    console.info(`${chalk.green("Info:")} Writing session file...`);

    fs.writeFileSync(
      "state.session",
      Buffer.from(cookiesString).toString("base64")
    );

    console.info(`${chalk.green("Info:")} Session has been created...`);
    console.info(`${chalk.green("Success:")} You may run the start command.`);
  } catch (err) {
    if (err.message.includes("div[role=feed]")) {
      console.log(
        chalk.red("Error: ") +
          "Invalid username or password. If you're account enable 2FA please disable it."
      );
    } else {
      console.log(chalk.red("Error: ") + err.message);
    }
  }

  await browser.close();
})();
