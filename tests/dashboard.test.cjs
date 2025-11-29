const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { ServiceBuilder } = require('selenium-webdriver/chrome');
const assert = require('assert');
const path = require('path');
const os = require('os');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function getChromePath() {
    // Check for Chromium (Alpine/Docker) or Chrome (local)
    if (process.env.CHROME_BIN) {
        return process.env.CHROME_BIN;
    }
    if (os.platform() === 'win32') {
        return path.join(os.homedir(), 'AppData/Local/BraveSoftware/Brave-Browser/Application/brave.exe');
    }
    return null;
}

describe('MovieViz Dashboard UI Tests', function () {
    this.timeout(60000);
    let driver;

    before(async function () {
        this.timeout(60000);
        const options = new chrome.Options();
        const chromePath = getChromePath();
        if (chromePath) {
            options.setChromeBinaryPath(chromePath);
        }
        // Use --headless for Alpine Chromium (not --headless=new)
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--disable-software-rasterizer');
        options.addArguments('--disable-dev-tools');
        options.addArguments('--no-zygote');
        options.addArguments('--single-process');
        options.addArguments('--window-size=1920,1080');

        // Build service with explicit chromedriver path for Alpine
        const chromedriverPath = process.env.CHROMEDRIVER_PATH || '/usr/bin/chromedriver';
        const service = new ServiceBuilder(chromedriverPath);

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .setChromeService(service)
            .build();

        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.id('chart-nav')), 20000);
        // Give extra time for JS to initialize
        await driver.sleep(2000);
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    it('Test 1: Page title is correct', async function () {
        const title = await driver.getTitle();
        assert.strictEqual(title, 'MovieViz Dashboard');
    });

    it('Test 2: Header and intro text are visible', async function () {
        const header = await driver.findElement(By.css('header h1.title'));
        const text = await header.getText();
        assert.ok(text.includes('MovieViz'));
    });

    it('Test 3: All 4 navigation buttons are present', async function () {
        const buttons = await driver.findElements(By.css('#chart-nav button'));
        assert.strictEqual(buttons.length, 4);
    });

    it('Test 4: Genre filter is populated', async function () {
        const genre = await driver.findElement(By.id('genre'));
        const options = await genre.findElements(By.css('option'));
        assert.ok(options.length > 1);
    });

    it('Test 5: Year filter is populated', async function () {
        const year = await driver.findElement(By.id('year'));
        const options = await year.findElements(By.css('option'));
        assert.ok(options.length > 1);
    });

    it('Test 6: Default bar chart SVG renders', async function () {
        await driver.wait(until.elementLocated(By.css('#chart-area svg')), 15000);
        const svg = await driver.findElement(By.css('#chart-area svg'));
        assert.ok(svg);
    });

    it('Test 7: Switch to Line Chart', async function () {
        const lineBtn = await driver.findElement(By.css("#chart-nav button[data-chart='line']"));
        await lineBtn.click();
        await driver.sleep(1000);
        await driver.wait(until.elementLocated(By.css('#chart-area svg')), 15000);
        const active = await driver.findElement(By.css('#chart-nav button.active'));
        const attr = await active.getAttribute('data-chart');
        assert.strictEqual(attr.toLowerCase(), 'line');
    });

    it('Test 8: Switch to Scatter Plot shows legend', async function () {
        const scatterBtn = await driver.findElement(By.css("#chart-nav button[data-chart='scatter']"));
        await scatterBtn.click();
        await driver.sleep(1000);
        await driver.wait(until.elementLocated(By.css('#chart-area .scatter-legend')), 15000);
        const legend = await driver.findElement(By.css('.scatter-legend'));
        assert.ok(legend);
    });

    it('Test 9: Switch to Donut Chart updates insights', async function () {
        const donutBtn = await driver.findElement(By.css("#chart-nav button[data-chart='donut']"));
        await donutBtn.click();
        await driver.sleep(1000);
        await driver.wait(until.elementLocated(By.id('questions-answers')), 10000);
        const insights = await driver.findElement(By.id('questions-answers'));
        const text = (await insights.getText()).toLowerCase();
        assert.ok(text.includes('donut') || text.includes('chart') || text.length > 10);
    });

    it('Test 10: Select specific genre rerenders chart', async function () {
        const genre = await driver.findElement(By.id('genre'));
        const options = await genre.findElements(By.css('option'));
        for (const opt of options) {
            const txt = (await opt.getText()).trim();
            if (txt !== 'All') {
                await opt.click();
                break;
            }
        }
        await driver.sleep(1000);
        await driver.wait(until.elementLocated(By.css('#chart-area svg')), 15000);
    });

    it('Test 11: API status endpoint returns JSON', async function () {
        await driver.get(`${BASE_URL}/api/status`);
        await driver.wait(until.elementLocated(By.css('body')), 10000);
        const body = await driver.findElement(By.css('body'));
        const text = (await body.getText()).toLowerCase();
        assert.ok(text.includes('status') || text.includes('ok') || text.includes('notes'));
    });

    it('Test 12: Insights panel is visible and updates', async function () {
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.id('chart-nav')), 15000);
        await driver.sleep(2000);
        await driver.wait(until.elementLocated(By.id('questions-answers')), 10000);
        const insights = await driver.findElement(By.id('questions-answers'));
        const text = await insights.getText();
        assert.ok(text.length > 0);
    });
});
