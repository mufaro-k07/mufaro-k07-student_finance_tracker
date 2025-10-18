import * as storage from "./storage.js";
import * as ui from "./ui.js";

let appData = storage.load()
let appSettings = storage.loadSettings()

const StateUpdates = () => {
    storage.save(appData);
    ui.refreshtransactions()
    ui.updateDashboard()

};
// Getters
export const getData = () => appData
export const getSettings = () => appSettings;
export const settings = {
    cap: 0,
    baseCurrency: "USD",
    exchangeRate: {}
};

// Adding a New Transaction
export const addTransaction = (record) => {
    const newTransaction = {
        description: record.description,
        amount: record.amount,
        category: record.category,
        date: record.date,

        id: 'txn_' +Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    appData.push(newTransaction);
    StateUpdates();
};

export const deleteTransaction = (delete_id) => {
    const index = appData.findIndex(record => record.id === delete_id);

    if (index !== -1) {
        appData.splice(index, 1);
        updateStateandSave();
    }

    StateUpdates();
};

export const updateTransaction = (update_id, updates) => {
    let found = false;

    appData.forEach((record, index) => {
        if (record.id === update_id) {

            for (const key in updates) {
                if (key === update_id) {
                    appData[index][key] = updates[key];
                }
            }

            appData[index].updatedAt = new Date().toISOString();
            found = true;
        }
    });

    if (found) {
        StateUpdates();
    }
};
export const updateSettings = (updates) => {
    appSettings = { ...appSettings, ...updates };
    storage.saveSettings(appSettings);
    ui.updateDashboard()
};




