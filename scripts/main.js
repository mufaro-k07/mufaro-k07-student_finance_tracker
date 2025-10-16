const BudgetCapInput = document.getElementById("setting_cap");
const CapButton = document.getElementById("capButton")
const SetCurrency = document.getElementById("base_currency");

const ExportButton = document.getElementById("export_button");
const ImportButton = document.getElementById("import_button");
const ImportFile = document.getElementById("import_file");
const ImportStatus = document.getElementById("import_status");

const Settings_Saved = () => {
    const capValue = parseFloat(BudgetCapInput.value);
    const currencyValue = SetCurrency.value

    state.updateSettings({
        cap: capValue,
        base_currency: currencyValue,
    })

    ui.updateDashboard();
    alert('Settings saved successfully!');
};

CapButton.addEventListener('click', Settings_Saved);
