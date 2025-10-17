// This is the javascript which handles saving to localStorage


const KEY = 'financeTracker';
const SETTINGS_KEY = 'financesettings';

/**
 *  The application loads from localStorage.
 *  If there is no data loaded, it will return an empty array.
 *  @returns {Array}
 */

export const load = () => {
    // It loads the data from localStorage and parses it from JSON string to a JavaScript object
    try {
        const data = localStorage.getItem(KEY);
        return JSON.parse(data || '[]');
    } catch (e) {
        console.error("Error in parsing data from storage to the array");
        return [];
    }

};

export const save = (data) => {
    // Converts the array back to JSON string using stringify
    localStorage.setItem(KEY, JSON.stringify(data));
};

export const loadSettings = () => {
    const settingsString = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return settingsString ? JSON.parse(settingsString) : {cap: 0, baseCurrency: 'USD'};
};

export const saveSetting = (data) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
};

