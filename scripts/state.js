import * as storage from "./storage.js";
import * as ui from "./ui.js";

let appData = (() => {
    try {
        const data = storage.load()
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Error loading app data", e)
        return [];
    }
})();

// These are the Default Settings
export const settings = {
    cap: 0,
    baseCurrency: "USD",
    exchangeRate: {}

};

let appSettings = {...settings,...(storage.loadSettings?.() || {}) };

const StateUpdates = () => {
    try {
        storage.save(appData);
        ui.refreshTransactions()
        ui.updateDashboard()
    } catch (e) {
        console.error("Error saving or updating app data", e)
    }

};
// Getters
export const getData = () => appData
export const getSettings = () => appSettings;

// Adding a New Transaction
export const addTransaction = (record) => {

    const newTransaction = {
        description: record.description,
        amount: record.amount,
        category: record.category,
        date: record.date,

        id: 'txn_' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    appData.push(newTransaction);
    StateUpdates();
};

export const deleteTransaction = (delete_id) => {
    try {
        const index = appData.findIndex(record => record.id === delete_id);
        if (index !== -1) {
            appData.splice(index, 1);
            StateUpdates();
        } else {
            console.warn("Transaction deleted failed, not found", delete_id);
        }
    } catch (e) {
        console.error("Error deleting transaction", e);
    }
};

export const updateTransaction = (update_id, updates) => {
    try {
        const index = appData.findIndex(r => r.id === update_id);
        if (index === -1) {
            console.warn("Transaction not found:", update_id);
            return;
        }

        Object.assign(appData[index], updates, {
            updatedAt: new Date().toISOString()
        });

        StateUpdates();
    } catch (e) {
        console.error("Error updating transaction:", e);
    }
};

export const updateSettings = (updates) => {
    try {
        appSettings = { ...appSettings, ...updates };
        storage.saveSettings(appSettings);
        ui.updateDashboard();
    } catch (e) {
        console.error("Error updating settings:", e);
    }
};
