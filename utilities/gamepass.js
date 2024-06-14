const puppeteer = require("puppeteer-extra");
const { executablePath } = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const noblox = require("noblox.js");
const axios = require("axios").default;
const fs = require("fs");
const dotenv = require('dotenv').config();
const download = require("image-downloader");

const cookie = process.env.COOKIE;
const placeId = process.argv[2];
const numberOfGamePasses = parseInt(process.argv[3]);
const imageLink = process.argv[4] || "";

if (!cookie) {
    console.log("User not found");
    return;
}

(async () => {
    const browser = await puppeteer.launch({ executablePath: executablePath(), headless: true });
    const page = await browser.newPage();

    try {
        const cookies = [
            {
                name: ".ROBLOSECURITY",
                value: cookie,
                domain: ".roblox.com",
            },
        ];
        await page.setCookie(...cookies);
        await page.goto(`https://create.roblox.com/dashboard/creations/experiences/${placeId}/associated-items?activeTab=Pass`, { waitUntil: "networkidle0" });

        let imagePath = "./Donation.png";
        if (imageLink) {
            try {
                console.log("Downloading image from:", imageLink);
                const options = {
                    url: imageLink,
                    dest: './Donations.png'
                };
                const { filename } = await download.image(options);
                imagePath = filename;
                console.log("Image downloaded to:", imagePath);
            } catch (e) {
                console.error("Failed to download image, using Donation.png instead.", e);
            }
        }

        async function create() {
            let retry = true;
            try {
                await page.reload({ waitUntil: "networkidle0" });
                await page.click('[data-testid="createAssociatedItemsButton"]');
                await page.waitForTimeout(500);
                let upload = await page.$("input[type=file]");
                await upload.uploadFile(imagePath);
                await page.waitForTimeout(500);
                await page.click('[data-testid="create-pass-button"]');
                await page.waitForTimeout(500);
            } catch (e) {
                if (retry) {
                    console.log("Failed, retrying in 60 seconds");
                    retry = false;
                    await new Promise((r) => setTimeout(r, 60000));
                    await create();
                } else {
                    console.log("Failed");
                }
            }
        }

        let gamepass = await noblox.getGamePasses(placeId);
        let gamepassold = await noblox.getGamePasses(placeId);

        for (let i = 1; i <= numberOfGamePasses; i++) {
            await create();
            gamepassold = gamepass;
            gamepass = await noblox.getGamePasses(placeId);
            if (gamepassold.length === gamepass.length) {
                console.log("Rate limited, retrying in 15 seconds");
                await new Promise((r) => setTimeout(r, 15000));
            } else {
                console.log(`Created gamepass ${gamepass.length}`);
            }
        }
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
})();
