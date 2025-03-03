const { Builder, By, Key, until } = require("selenium-webdriver");
const chai = require("chai");
const expect = chai.expect;
require("chromedriver");

const baseUrl = "http://localhost:3000";
const testUsername = `testuser_${Date.now()}`;
const testPassword = "password";

// **Wait for sessionToken to be stored in localStorage**
async function waitForSessionToken(driver) {
    let maxRetries = 10;
    while (maxRetries > 0) {
        let token = await driver.executeScript("return localStorage.getItem('sessionToken');");
        if (token) {
            console.log("✅ sessionToken successfully retrieved:", token);
            return;
        }
        console.log("⏳ Waiting for sessionToken to be stored in localStorage...");
        await driver.sleep(1000);
        maxRetries--;
    }
    throw new Error("❌ sessionToken retrieval failed, possible login issue!");
}

// **Ensure sessionToken is still valid**
async function ensureLoggedIn(driver) {
    let token = await driver.executeScript("return localStorage.getItem('sessionToken');");
    if (!token) {
        console.log("⚠️ sessionToken missing, re-logging in...");
        await loginUser(driver);
    } else {
        console.log("✅ sessionToken is still valid");
    }
}

// **Wait for the survey to appear on the Home page**
async function waitForSurveyToAppear(driver) {
    let maxRetries = 10;
    while (maxRetries > 0) {
        let elements = await driver.findElements(By.xpath("//h3[contains(text(),'Test Survey')]"));
        if (elements.length > 0) {
            console.log("✅ Survey successfully displayed on the Home page");
            return;
        }
        console.log("⏳ Waiting for survey data to load...");
        await driver.sleep(2000);
        maxRetries--;
    }
    throw new Error("❌ Survey not found after 20 seconds, possible backend sync issue!");
}

// **Handle alerts if present**
async function dismissAlertIfPresent(driver) {
    try {
        await driver.wait(until.alertIsPresent(), 3000);
        let alert = await driver.switchTo().alert();
        console.log("🔔 Unexpected Alert:", await alert.getText());
        await alert.accept();
        console.log("✅ Alert dismissed");
    } catch (error) {
        // Ignore error if no alert is present
    }
}

// **Login function**
async function loginUser(driver) {
    console.log("🔄 Re-logging in...");
    await driver.get(baseUrl + "/login");

    await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Please enter your username']")), 5000);
    await driver.findElement(By.xpath("//input[@placeholder='Please enter your username']")).sendKeys(testUsername);
    await driver.findElement(By.xpath("//input[@placeholder='Please enter your password']")).sendKeys(testPassword, Key.RETURN);
    
    await driver.wait(until.urlContains("/"), 5000);
    console.log("✅ Successfully logged in");

    // **Wait for sessionToken to be stored in localStorage**
    await waitForSessionToken(driver);
}

async function runTests() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        // **1. User Registration**
        await driver.get(baseUrl + "/register");

        await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Enter your username']")), 5000);
        await driver.findElement(By.xpath("//input[@placeholder='Enter your username']")).sendKeys(testUsername);
        await driver.findElement(By.xpath("//input[@placeholder='Enter your email']")).sendKeys(`${testUsername}@example.com`);
        await driver.findElement(By.xpath("//input[@placeholder='Enter your password']")).sendKeys(testPassword);
        await driver.findElement(By.xpath("//input[@placeholder='Confirm your password']")).sendKeys(testPassword, Key.RETURN);

        // **2. Handle registration success alert**
        await dismissAlertIfPresent(driver);

        await driver.wait(until.urlContains("login"), 5000);
        console.log("✅ Registration successful, proceeding to login");

        // **3. Login**
        await loginUser(driver);

        // **4. Ensure sessionToken is still valid**
        await ensureLoggedIn(driver);

        // **5. Navigate to `CreateApplication` page**
        await driver.get(baseUrl + "/CreateApplication");
        await dismissAlertIfPresent(driver);
        console.log("✅ Entered `CreateApplication` page");

        await driver.wait(until.elementLocated(By.id("surveyName")), 5000);
        await driver.findElement(By.id("surveyName")).sendKeys("Test Survey");
        await driver.findElement(By.id("surveyDescription")).sendKeys("This is a test survey");

        // **6. Submit the survey**
        await driver.findElement(By.className("submit-btn")).click();
        console.log("✅ Survey submitted successfully");

        // **7. Handle "Survey Created" alert**
        await dismissAlertIfPresent(driver);

        // **8. Navigate to Home page and wait for the survey to appear**
        await driver.get(baseUrl + "/");
        await driver.executeScript("window.location.reload();");
        await waitForSurveyToAppear(driver);

        // **9. Enter survey details page**
        console.log("🔍 Clicking `Details` button to enter survey details page");
        await driver.findElement(By.xpath("//button[contains(text(),'Details')]")).click();
        await driver.wait(until.urlContains("/survey/"), 5000);

        // **10. Verify survey details page content**
        let detailHeader = await driver.findElement(By.tagName("h2"));
        expect(await detailHeader.getText()).to.equal("Survey Questions");
        console.log("✅ Successfully entered survey details page");

    } finally {
        await driver.quit();
    }
}

// Run the test
runTests().catch(console.error);
