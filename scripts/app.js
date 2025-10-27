// importing the other js scripts into the main Javascript file
import * as state from "./state.js";
import * as ui from "./ui.js";
import * as validators from "./validators.js";
import {loadSettings, exportData, importData } from "./storage.js";

// Form and the form errors
const form = document.getElementById("transaction_form");
form.noValidate = true;
const formErrors = document.getElementById("form_error");
let editingId = null;
const submitButton = document.getElementById("form_submit");

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
const navButtons = document.querySelectorAll("nav button");

const handleFormSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const record = {};
    let isValid = true;
    let errors = [];

    for (const [name, value] of formData.entries()) {
        record[name] = value;

        if (name === 'type') continue;

        const error = validators.Valid(name, value);
        if (error) {
            isValid = false;
            errors.push(error);
        }
    }

    if (!isValid) {
        formErrors.textContent = 'Validation Errors: ' + errors.join('; ');
        return;
    }

    formErrors.textContent = '';

    let amount = parseFloat(record.amount);
    // This checks the record type with the feature of expenses being negative and income being positive
    if (record.type === 'expense') {
        amount = -Math.abs(amount);
    } else {
        amount = Math.abs(amount)
    }

    const normalized = {
        description: record.description.trim(),
        category: record.category.trim(),
        date: record.date,
        amount
    };

    if (editingId) {
        state.updateTransaction(editingId, normalized);
        editingId = null;
        submitButton.textContent = 'Save Transaction';
        submitButton.setAttribute('data-action', 'add-edit');
        ui.View('transactions');
        ui.announce('Transaction updated!', 'polite');
    } else {
        state.addTransaction(normalized);
        ui.View('transactions');
        ui.announce('Transaction added successfully!', 'polite');
    }

    form.reset();
};
    // It creates and add the final transaction object
    const finalTransaction = {
        description: record.description.trim(),
        category: record.category.trim(),
        date: record.date,
        amount: amount,
    };

    state.addTransaction(finalTransaction);
    form.reset();
    ui.View('transactions');
    ui.announce('Transaction added successfully!', 'polite');

const Settings_Saved = () => {
    const capValue = parseFloat(BudgetCapInput.value);
    const currencyValue = SetCurrency.value

    if (isNaN(capValue) || capValue < 0) {
        ui.announce('Budget Cap must be a valid positive number', 'assertive')
        BudgetCapInput.focus()
        return;
    }

    state.updateSettings({
        cap: capValue,
        baseCurrency: currencyValue,
    })

    ui.updateDashboard();
    const pretty = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(capValue);
    ui.announce(capValue > 0 ? `Budget cap set: ${pretty} ${currencyValue}` : 'Budget cap cleared', 'polite');
};

const loadApp = () => {
    console.log('The Student Finance Tracker has been Initialised.')

    // Handles the navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            ui.View(button.getAttribute('data-view'));
        })
    })

    searchInput.addEventListener('input', (event) => {
        ui.refreshTransactions(event.target.value)
    })

    recordsTable.addEventListener('click', (event) => {
        const header = event.target.closest('th');
        const actionButton = event.target.closest('button[data-action]');

        if (header && header.hasAttribute('data-sort')) {
            ui.refreshTransactions(searchInput.value)
        }

        if (actionButton) {
            const id = actionButton.getAttribute('data-id');
            const action = actionButton.getAttribute('data-action');

            if (action === 'delete' && confirm('Are you sure you want to delete this transaction?')) {
                state.deleteTransaction(id)
                ui.refreshTransactions(searchInput.value)
                ui.updateDashboard()
                ui.announce('Transaction deleted', 'assertive')
            }
            if (action === 'edit') {
                const rec = state.getData().find(r => r.id === id)
                if (!rec) return;

                document.getElementById('form_description').value = rec.description;
                document.getElementById('form_category').value = rec.category;
                document.getElementById('form_date').value = rec.date;

                const isExpense = rec.amount < 0;
                document.getElementById('form_type').value = isExpense ? 'expense' : 'income';
                document.getElementById('form_amount').value = Math.abs(rec.amount).toFixed(2);

                editingId = id;
                submitButton.textContent = 'Update Transaction';
                submitButton.setAttribute('data-action', 'update');

                ui.View('form');
                ui.announce('Editing transaction…', 'polite');
            }
        }

    });

    CapButton.addEventListener('click', Settings_Saved)
    SetCurrency.addEventListener('change', Settings_Saved)
    ExportButton.addEventListener('click', () => exportData(state.getData()))

    ImportFile.addEventListener('change', () => {
        ImportButton.disabled = !ImportFile.files.length
        ImportStatus.textContent = ImportFile.files.length
            ? ` ${ImportFile.files[0].name} is ready to load` : ''
    })

    ImportButton.addEventListener('click', () => {
        if (ImportFile.files.length) {
            importData(ImportFile.files[0]);
        }
    })
    const currentSettings = loadSettings();
    BudgetCapInput.value = currentSettings.cap;
    SetCurrency.value = currentSettings.baseCurrency;
    ui.View('dashboard');
    ui.refreshTransactions()
}

form.addEventListener('submit', handleFormSubmit);
loadApp();
