import * as storage from "./storage.js";

let appData = storage.load()
let appSettings = storage.loadSettings()

const StateUpdates = () => {
    storage.save(appData);

}
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

        id: 'txn' +Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    appData.push(newTransaction);

    StateUpdates();
};

export const deleteTransaction = (delete_id) => {
    Index=(r => r.id === delete_id)
    appData.splice(appData.indexOf(delete_id), 1);

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




