// ==UserScript==
// @name         Check test
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Alert to new test
// @author       You
// @match        https://driverpracticaltest.dvsa.gov.uk/manage*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dvsa.gov.uk
// @grant        GM_notification
// ==/UserScript==

// USAGE
//    1. Update CURRENT_TEST_DATE and TESTS_BEFORE to your values
//    2. Login to DVSA site with your usual
//    3. Enable script in tampermonkey

// the test you have currently booked. Format YYYY-MM-DD
const CURRENT_TEST_DATE = new Date("2026-06-02");
// i.e. only report if a test becomes free before this date. Format YYYY-MM-DD
const TESTS_BEFORE = new Date("2026-06-01");

function getBack() {
    const executions = ["e1s1", "e2s1", "e3s1", "e4s1", "e5s1"];
    const randomExecution = executions[Math.floor(Math.random() * executions.length)];
    document.location.href = `https://driverpracticaltest.dvsa.gov.uk/manage?execution=${randomExecution}`;
}

function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function log(message) {
    const today = new Date();
    const formatted = today.toLocaleString();
    console.log(`${formatted}: ${message}`);
}

(function() {
    'use strict';
    const interval = randomIntBetween(200000, 260000); // Random interval between 200s - 250s

    if (document.title === "") {
        log("Empty page title encountered — stopping.");
        GM_notification({
            title: "DVSA Blank Page",
            text: "Unexpected page encountered, please reload and sign in again!",
            timeout: 0
        });
        alert("DVSA script stopped!\n\nEmpty page title. Please check the browser tab.");
        return; // No getBack()
    }

    if (document.title.includes("Booking details")) {
        log("Selecting 'change driving test booking'");
        const changeButton = document.getElementById("date-time-change");
        setTimeout(() => changeButton.click(), randomIntBetween(3000, 9000));
        return;
    }

    if (document.title.includes("Test date - Change")) {
        log("Selecting 'earliest date possible'");
        const clickEarliest = document.getElementById("test-choice-earliest");
        const submit = document.getElementById("driving-licence-submit");
        setTimeout(() => {
            clickEarliest.checked = true;
            setTimeout(() => {
                submit.click();
            }, randomIntBetween(1000, 3000));
    }, randomIntBetween(3000, 8000));
    return;
    }

    if (document.title.includes("test times available")) {
        log("Checking available driving test dates...");
        const bookableDate = document.querySelector(".BookingCalendar-date--bookable > div:nth-child(1) > a:nth-child(1)");
        if (bookableDate) {
            const available = new Date(bookableDate.getAttribute("data-date"));
            log(`Date of booking available: ${available.toISOString().slice(0, 10)}`);

            if (available.getTime() === CURRENT_TEST_DATE.getTime()) {
                log("Available booking is the same as your current booking.");
            } else if (available.getTime() >= TESTS_BEFORE.getTime()) {
                log("Still too long away.");
            } else {
                log("Change detected!!!");
                GM_notification({ title: "DVSA Test Checker - Test Date Found", text: "Earlier Date Found" });
            }
        } else {
            log("No bookable dates found.");
        }
        setTimeout(getBack, interval);
        return;
    }

    // ── Catch-all: unexpected page (captcha, error, session timeout, etc.) ──
    log(`Unexpected page encountered: "${document.title}" — stopping.`);
    GM_notification({ title: "DVSA Test Checker", text: "Unexpected page encountered" });
    alert(`DVSA script stopped!\n\nUnexpected page: "${document.title}"\n\nPlease check the browser tab.`);
    // Intentionally no getBack() call — script halts here.

})();
