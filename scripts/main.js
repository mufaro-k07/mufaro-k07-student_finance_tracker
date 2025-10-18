// importing the other js scripts into the main Javascript file
import * as state from "./state.js";
import * as ui from "./ui.js";
import * as validators from "./validators.js";
import {loadSettings, exportData, importData } from "./storage.js";

// Form
const form = document.getElementById("transaction_form");
const formErrors = document.getElementById("form_errors");

//Settings and Navigation elements
const BudgetCapInput = document.getElementById("setting_cap");
const CapButton = document.getElementById("cap_button")
const SetCurrency = document.getElementById("base_currency");
const ExportButton = document.getElementById("export_button");
const ImportButton = document.getElementById("import_button");
const ImportFile = document.getElementById("import_file");
const ImportStatus = document.getElementById("import_status");
const recordsTable = document.querySelector("#transactions_table");
const searchInput = document.getElementById("regex_search");
const navButtons = document.querySelectorAll(".nav button");

const Settings_Saved = () => {
    const capValue = parseFloat(BudgetCapInput.value);
    const currencyValue = SetCurrency.value

    state.updateSettings({
        cap: capValue,
        baseCurrency: currencyValue,
    })

    ui.updateDashboard();
    ui.announce('Settings saved successfully!');
};

ui.View('dashboard');


const LoadApp = () => {
    console.log('The Student Finance Tracker has been Initialised.')

    form.addEventListener('submit', handleformSubmit);

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            ui.View(button.getAttribute('data-view'));
        })
    })

    searchInput.addEventListener('input', (event) => {
        ui.refreshRecords(event.target.value)
    })

    recordsTable.addEventListener('click', (event) => {
        const header = event.target.closest('th');
        const actionButton = event.target.closest('button[data-action]');

        if (header && header.hasAttribute('data-sort')) {
            ui.refreshRecords(searchInput.value)
        }

        if (actionButton) {
            const id = actionButton.getAttribute('data-id');
            const action = actionButton.getAttribute('data-action');

            if (action === 'delete' && confirm('Are you sure you want to delete this transaction?')) {
                state.deleteTransaction(id)
                ui.refreshRecords(searchInput.value)
                ui.updateDashboard()
                ui.announce('Transaction deleted', 'status')
            }
        }
    });

    CapButton.addEventListener('click', Settings_Saved)
    SetCurrency.addEventListener('change', Settings_Saved)
    ExportButton.addEventListener('click', () => state.exportData(state.getData()))

    ImportFile.addEventListener('change', () => {
        ImportButton.disabled = !ImportFile.files.length
        ImportStatus.textContent = ImportFile.files.length
            ? ` ${ImportFile.files[0].name} is ready to load` : ''
    })

    ImportButton.addEventListener('click', () => {
        if (ImportFile.files.length) {
            state.importData(ImportFile.files[0]);
        }
    })

    loadSettings();
    ui.View('dashboard');

    ui.refreshRecords()
}

LoadApp();
