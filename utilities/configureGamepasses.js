const puppeteer = require("puppeteer-extra");
const { executablePath } = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const dotenv = require("dotenv").config();
const noblox = require("noblox.js");

puppeteer.use(StealthPlugin());

const cookie = process.env.COOKIE;
const placeId = process.argv[2];
const UniverseId = process.argv[2];
const gamePassPrices = process.argv[3]?.split(",").map(Number);

if (!cookie || !placeId || !gamePassPrices || gamePassPrices.includes(NaN)) {
    console.error("Invalid input: COOKIE, UniverseId/PlaceId, or Game Pass Prices are missing or incorrect.");
    process.exit(1);
}

async function configureGamePasses() {
    const browser = await puppeteer.launch({ executablePath: executablePath(), headless: true });
    const page = await browser.newPage();

    try {
        await page.setCookie({
            name: ".ROBLOSECURITY",
            value: cookie,
            domain: ".roblox.com",
        });

        const gamePasses = await noblox.getGamePasses(UniverseId);

        for (let i = 0; i < gamePasses.length; i++) {
            const gamePassId = gamePasses[i].id;
            const priceIndex = i % gamePassPrices.length;
            const price = gamePassPrices[priceIndex];

            const url = `https://create.roblox.com/dashboard/creations/experiences/${placeId}/passes/${gamePassId}/sales`;

            console.log(`Processing Game Pass ${gamePassId} with price ${price}`);

            await page.goto(url, { waitUntil: "networkidle0" });

            await page.click('.PrivateSwitchBase-input.MuiSwitch-input.web-blox-css-mui-1m9pwf3');
            await page.waitForTimeout(100);

            await page.type('.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputAdornedStart.web-blox-css-mui-1873rh', price.toString(), { delay: 50 });

            await page.click('.MuiButtonBase-root.MuiButton-root.web-blox-css-tss-1cycaj8-Typography-buttonLarge-submitButton.MuiButton-contained.web-blox-css-tss-laypq9-Button-contained.MuiButton-containedPrimary.MuiButton-sizeLarge.MuiButton-containedSizeLarge.MuiButton-root.web-blox-css-tss-1cycaj8-Typography-buttonLarge-submitButton.MuiButton-contained.web-blox-css-tss-laypq9-Button-contained.MuiButton-containedPrimary.MuiButton-sizeLarge.MuiButton-containedSizeLarge.web-blox-css-mui-l8d4nv-Typography-button');

            await page.waitForTimeout(500);

            const gamePassesUrl = `https://create.roblox.com/dashboard/creations/experiences/${placeId}/monetization/passes`;
            await page.goto(gamePassesUrl, { waitUntil: "networkidle0" });

            console.log(`Configured Game Pass ${gamePassId} successfully.`);
        }

        console.log("All game passes configured successfully.");
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
}

configureGamePasses();
