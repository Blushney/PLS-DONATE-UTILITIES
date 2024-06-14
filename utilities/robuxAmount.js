const puppeteer = require("puppeteer");
const colors = require("colors");
const fs = require("fs");
const dotenv = require('dotenv').config();
let total = [];
let pendingTotal = [];

console.log("This may take a few minutes...\n\n");

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const roblosecurity = process.env.cookie;
    
    await page.setCookie({
        name: ".ROBLOSECURITY",
        value: roblosecurity,
        domain: ".roblox.com"
    });
    
    await page.goto("https://www.roblox.com/transactions", { waitUntil: "networkidle0" });
    let robux = [];

    async function getBalance() {
        robux = await page.evaluate(async () => {
            try {
                let pending = document.getElementsByClassName("amount icon-robux-container text-disabled")[0] ? document.getElementsByClassName("amount icon-robux-container text-disabled")[0].innerText : "0";
                let current = document.getElementsByClassName("rbx-text-navbar-right text-header")[0] ? document.getElementsByClassName("rbx-text-navbar-right text-header")[0].innerText : "0";
                return [parseInt(pending.replace(/[\s, ]/g, "")), parseInt(current.replace(/[\s, ]/g, ""))];
            } catch (e) {}
        });
        if (!robux) await getBalance();
    }

    await getBalance();

    if (robux[0] > 0 || robux[1] > 0) {
        pendingTotal.push(robux[0]);
        total.push(robux[1]);
        console.log("Current: ".cyan + robux[1] + " R$");
        console.log("Pending: ".grey + robux[0] + " R$");
    }

    let totalAdded = total.reduce((a, b) => a + b, 0);
    let pendingTotalAdded = pendingTotal.reduce((a, b) => a + b, 0);

    console.log("\nTotal".cyan);
    console.log("Current: " + totalAdded + " R$");
    console.log("Pending: ".grey + pendingTotalAdded + " R$");

    let allTotal = totalAdded + pendingTotalAdded;

    console.log(allTotal + " R$".green);
    console.log("\nAfter Taxes (30%): " + Math.round(allTotal * 0.7) + " R$");

    await browser.close();
})();
