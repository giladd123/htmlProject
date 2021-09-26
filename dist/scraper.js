const puppeteer = require("puppeteer");
(async () => { })();
async function getBankData(bank, bankAccount, password) {
    if (bank == "habenleumi") {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("https://www.fibi.co.il/wps/portal/");
        await page.waitForSelector("#layoutContainers > div > div.wptheme1Col > div > div.component-control.id-Z7_5G3DTJOFILEIE0QGETKUFF2G03 > section > div.wpthemeControlBody.wpthemeOverflowAuto.wpthemeClear.wellfixed > section > div:nth-child(3) > div > ul > li:nth-child(1) > a");
        const button = await page.$("#layoutContainers > div > div.wptheme1Col > div > div.component-control.id-Z7_5G3DTJOFILEIE0QGETKUFF2G03 > section > div.wpthemeControlBody.wpthemeOverflowAuto.wpthemeClear.wellfixed > section > div:nth-child(3) > div > ul > li:nth-child(1) > a");
        await button.click();
        await page.waitForSelector("#login");
        const frameHandle = await (await page.$("#loginFrame")).contentFrame();
        await frameHandle.waitForSelector("#username");
        const username = await frameHandle.$("#username");
        await sleep(1100);
        await username.type(bankAccount, { delay: 70 });
        await sleep(1000);
        const pass = await frameHandle.$("#password");
        await pass.type(password, { delay: 50 });
        const button2 = await frameHandle.$("#continueBtn");
        await button2.click();
        await page.waitForNavigation({ waitUntil: "load" });
        const button3 = await page.$("#div3 > table > tbody > tr.tr_one > td.first > span > a");
        await button3.click();
        await page.waitForNavigation({ waitUntil: "load" });
        let dates = await page.$$eval("#dataTable077 > tbody > tr > td.date.first > span", (arr) => arr.map((x) => x.innerHTML));
        let details = await page.$$eval("#dataTable077 > tbody > tr > td.reference.wrap_normal > div > a,#dataTable077 > tbody > tr > td.reference.wrap_normal > a > span,#\\32", (arr) => arr.map((x) => x.innerHTML));
        let kind = await page.$$eval("#dataTable077 > tbody > tr > td.details", (arr) => arr.map((x) => x.innerHTML));
        let credit = await page.$$eval("#dataTable077 > tbody > tr > td.credit > span", (arr) => arr.map((x) => x.innerHTML));
        let debit = await page.$$eval("#dataTable077 > tbody > tr > td.debit > span", (arr) => arr.map((x) => x.innerHTML));
        let balance = await page.$$eval("#dataTable077 > tbody > tr > td.balance.last > span", (arr) => arr.map((x) => x.innerHTML));
        await browser.close();
        let table = { dates, details, kind, credit, debit, balance };
        return table;
    }
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
module.exports.getBankData = getBankData;
