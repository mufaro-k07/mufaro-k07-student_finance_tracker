// This is the javascript which handles saving to localStorage

const KEY = 'financeTracker';
const SETTINGS_KEY = 'financesettings';

/**
 *  The application loads from localStorage.
 *  If there is no data loaded, it will return an empty array.
 */

export const load = () => {
    // It loads the data from localStorage and parses it from JSON string to a JavaScript object
    try {
        const data = localStorage.getItem(KEY);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Error parsing transaction data from storage into array:", e);
        return [];
    }
};

export const save = (data) => {
    // Converts the array back to JSON string using stringify
    try {
        if (!Array.isArray(data)) {
            console.error("Invalid data type for saving.");
        }
        localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Error saving data to storage:", e);
    }
};

export const loadSettings = () => {
    try {
        const settingsString = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        return settingsString ? JSON.parse(settingsString) : {cap: 0, baseCurrency: "USD"};
    } catch (e) {
        console.error("Error in loading settings from localStorage", e);
        return {cap: 0, baseCurrency: "USD"};
    }
};

export const saveSettings = (settings) => {
    if (typeof settings !== "object" || settings === null) {
        console.error("Invalid data type for saving.");
        return;
    }

    try {
        const json = JSON.stringify(settings);
        localStorage.setItem(SETTINGS_KEY, json);
    } catch (e) {
        console.error("Error saving settings to localStorage:", e);
    }
};

import * as state from "./state.js";
import * as ui from "./ui.js";

export const importData = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const result = event.target.result;
            if (typeof result !== "string") {
                console.error("The result of the FileReader is not a string");
            }

            const importedData = JSON.parse(result);

            const isValidRecord = (record) =>
                record &&
                typeof record.description === 'string' &&
                typeof record.amount === 'number' &&
                typeof record.category === 'string' &&
                typeof record.date === 'string';

            if (!Array.isArray(importedData) || !importedData.every(isValidRecord)) {
                ui.announce("Invalid data format: Must be an array of valid transactions.", "assertive");
                return;
            }

            const normalizedData = importedData.map((record) => ({
                ...record,
                id: 'txn_' + Date.now() + Math.random().toString(36).slice(2),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));

            normalizedData.forEach(state.addTransaction);

            ui.refreshTransactions();
            ui.updateDashboard();
            ui.announce("Data has been imported successfully!", "polite");

        } catch (e) {
            console.error("Error parsing imported file", e);
            ui.announce("Error parsing file. Make sure it's a valid JSON.", "assertive");
        }
    };

    reader.onerror = () => {
        console.error("File reading error:", reader.error);
        ui.announce("Error reading file.", "assertive");
    };

    reader.readAsText(file);
};

export const exportData = (data) => {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], {type: "application/json" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "student-finance-data.json";
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Failed to export data:", e);
        alert("There was a problem exporting your data.");
    }
};
