/*
    LambdaTest selenium automation sample example
    Configuration
    ----------
    username: Username can be found at automation dashboard
    accessToken:  AccessToken can be generated from automation dashboard or profile section

    Result
    -------
    Execute NodeJS Automation Tests on LambdaTest Distributed Selenium Grid 
*/
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
require('dotenv').config();

const Captcha = require("2captcha")

// A new 'solver' instance with our API key
const solver = new Captcha.Solver(process.env.CAPTCHA_SERVICE_API_KEY);

chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

/*
    Setup remote driver
    Params
    ----------
    platform : Supported platform - (Windows 10, Windows 8.1, Windows 8, Windows 7,  macOS High Sierra, macOS Sierra, OS X El Capitan, OS X Yosemite, OS X Mavericks)
    browserName : Supported platform - (chrome, firefox, Internet Explorer, MicrosoftEdge, Safari)
    version :  Supported list of version can be found at https://www.lambdatest.com/capabilities-generator/
*/

// username: Username can be found at automation dashboard
const USERNAME = process.env.LT_USERNAME;

// AccessKey:  AccessKey can be generated from automation dashboard or profile section
const KEY = process.env.LT_ACCESS_KEY;

// gridUrl: gridUrl can be found at automation dashboard
const GRID_HOST = 'hub.lambdatest.com/wd/hub';


async function loginToShopify() {

    // Setup Input capabilities
    const capabilities = {
        platform: 'MacOS Big sur',
        browserName: 'Chrome',
        version: '98.0',
        resolution: '1920x1080',
        geoLocation : "US",
        network: true,
        visual: true,
        console: true,
        video: true,
        name: 'Test 1', // name of the test
        build: 'NodeJS build', // name of the build,
        headless : false
    }

    const screen = {
        width: 640,
        height: 480
    };

    // URL: https://{username}:{accessToken}@beta-hub.lambdatest.com/wd/hub
    const gridUrl = 'https://' + USERNAME + ':' + KEY + '@' + GRID_HOST;

    // setup and build selenium driver object 
    let driver = new webdriver.Builder().usingServer(gridUrl).forBrowser('chrome').withCapabilities(capabilities).build();

    // Follows steps mentioned in https://2captcha.com/2captcha-api#solving_hcaptcha
    try {
        // Visit Shopify login page
        await driver.get('https://accounts.shopify.com/store-login');
        // Get hcaptcha element
        const el = await driver.findElement(webdriver.By.id('h-captcha'));
        // Wait until the field is rendered
        await driver.wait(webdriver.until.elementIsVisible(el), 3000);
        // Get the Google siteKey on the data attribute from the element
        const siteKey = await el.getAttribute('data-sitekey');
        // Invoke the captcha solving API powered by 2Captcha with siteKey and page URL
        const { data: data1 } = await solver.hcaptcha(siteKey, "https://accounts.shopify.com/store-login") || {};
        // Fill the data provided by the API into two hidden text areas on the page
        await driver.executeScript(`document.getElementsByName('g-recaptcha-response')[0].innerHTML='${data1}'`);
        await driver.executeScript(`document.getElementsByName('h-captcha-response')[0].innerHTML='${data1}'`);
        // Get Email Input field reference
        const emailInput = await driver.findElement(webdriver.By.id('account_email'));
        // Wait until the field is rendered
        await driver.wait(webdriver.until.elementIsVisible(emailInput), 3000);
        // Fill the field with email
        emailInput.sendKeys(process.env.SHOPIFY_ACCOUNT_EMAIL);
        // Submit the form
        emailInput.submit();
        // Wait until redirection happens to the passoword page
        await driver.wait(webdriver.until.urlContains('https://accounts.shopify.com/login'), 5000);
        // Invoke the captcha solving API powered by 2Captcha to solve 2nd hcaptcha with siteKey and page URL
        const { data: data2 } = await solver.hcaptcha(siteKey, "https://accounts.shopify.com/store-login") || {};
        // Fill the data provided by the API into two hidden text areas on the page
        await driver.executeScript(`document.getElementsByName('g-recaptcha-response')[0].innerHTML='${data2}'`);
        await driver.executeScript(`document.getElementsByName('h-captcha-response')[0].innerHTML='${data2}'`);
        // Get Password Input field reference
        const passwordInput = await driver.findElement(webdriver.By.id('account_password'));
        // Wait until the field is rendered
        await driver.wait(webdriver.until.elementIsVisible(passwordInput), 3000);
        // Fill the field with password
        passwordInput.sendKeys(process.env.SHOPIFY_ACCOUNT_PASSWORD);
        // Submit the form
        passwordInput.submit();
        // Success. Now we would've logged into Shopify account
    } catch(err) {
        console.log("test failed with reason " + err)
        driver.executeScript('lambda-status=failed');
        driver.quit();
    }
}
    
loginToShopify();
