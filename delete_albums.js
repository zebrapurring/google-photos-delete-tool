const maxAlbumCount = "ALL_ALBUMS";

const ELEMENT_SELECTORS = {
    albumMoreOptionsButton: 'a.MTmRkb button[aria-label="More options"]',
    confirmationButton: 'div[aria-modal="true"] > div > div > div > button:nth-of-type(2)'
};

const TIME_CONFIG = {
    delete_cycle: 3500,
    press_button_delay: 400,
};

const MAX_RETRIES = 100;
let albumCount = 0;

let deleteTask = setInterval(async () => {
    let moreOptionsButtons;
    let attemptCount = 1;

    do {
        moreOptionsButtons = document.querySelectorAll(ELEMENT_SELECTORS['albumMoreOptionsButton']);
        await new Promise(r => setTimeout(r, 300));
    } while (moreOptionsButtons.length <= 0 && attemptCount++ < MAX_RETRIES);

    if (moreOptionsButtons.length <= 0) {
        console.log("[INFO] No more albums found.");
        clearInterval(deleteTask);
        console.log("[SUCCESS] Tool exited.");
        return;
    }

    moreOptionsButtons[0].click();
    console.log("[INFO] Opened context menu for an album.");

    await new Promise(r => setTimeout(r, TIME_CONFIG['press_button_delay']));

    let menuItems = document.querySelectorAll('.aqdrmf-rymPhb-ibnC6b');
    let deleteMenuItem = null;

    for (let item of menuItems) {
        const label = item.getAttribute('aria-label') || item.textContent || '';
        if (label.toLowerCase().includes('delete')) {
            deleteMenuItem = item;
            break;
        }
    }

    if (!deleteMenuItem && menuItems.length > 0) {
        deleteMenuItem = menuItems[menuItems.length - 1];
    }

    if (!deleteMenuItem) {
        console.log("[WARN] Could not find Delete menu item. Skipping.");
        return;
    }

    deleteMenuItem.click();
    console.log("[INFO] Clicked Delete album.");

    await new Promise(r => setTimeout(r, TIME_CONFIG['press_button_delay']));

    let confirmButton = document.querySelector(ELEMENT_SELECTORS['confirmationButton'])
        ?? document.querySelector('div[aria-modal="true"] button:last-of-type');

    if (confirmButton) {
        confirmButton.click();
        albumCount++;
        console.log(`[INFO] Album #${albumCount} deleted.`);
    } else {
        console.log("[WARN] Confirmation button not found.");
    }

    if (maxAlbumCount !== "ALL_ALBUMS" && albumCount >= parseInt(maxAlbumCount)) {
        console.log(`[SUCCESS] ${albumCount} albums deleted as requested.`);
        clearInterval(deleteTask);
    }

}, TIME_CONFIG['delete_cycle']);
