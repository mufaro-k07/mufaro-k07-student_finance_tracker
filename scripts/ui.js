import * as state from "./state.js";
import { highlight, compileRegex} from "./search.js";

const MENU = {
    dashboard: document.getElementById("dashboard"),
    transaction: document.getElementById("transactions"),
    form: document.getElementById("form"),
    settings: document.getElementById("settings"),
    about: document.getElementById("about"),

}

const TableBody = document.getElementById("transactions_content");
const navigationButton = document.querySelectorAll("nav button");
const tableHeaders = document.querySelectorAll("#transactions_table th[data-sort]");

// Elements for the Dashboard
const totalExpense = document.getElementById('total_expense');
const totalIncome = document.getElementById('total_income');
const balance = document.getElementById('balance');
const topCategory = document.getElementById('top_category');
const trendChart = document.getElementById('weekly_trend_chart');
const targetStatus = document.getElementById('status_target');

let Sort_State = {field: 'date', direction: 'desc'};

export const View = (viewId) => {
    Object.values(MENU).forEach(section => section.classList.add('hidden'));

    const target = MENU[viewId];
    if (target) target.classList.remove('hidden');

    navigationButton.forEach(button => {
        const active = button.getAttribute('data-view') === viewId;
        button.classList.toggle('active', active);
        button.setAttribute('aria-current', active ? 'page' : 'false');
    })
}

// Sorting the data in descending order by the

const DataToSort = (data, field) => {
    if (Sort_State.field === field) {
        Sort_State.direction = Sort_State.direction === 'asc' ? 'desc' : 'asc';

    } else {
        Sort_State.field = field
        Sort_State.direction = 'desc'
    }

// Creating a copy of the array to sort so that the original one is not affected
    const sorted = [...data].sort((a, b) => {
        let comparison = 0;
        if (field === 'amount') {
            comparison = parseFloat(a.amount) - parseFloat(b.amount);
        } else if (field === 'date') {
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else {
            comparison = a[field].localeCompare(b[field], undefined, { sensitivity: 'base' });
        }

        return Sort_State.direction === 'asc' ? comparison : comparison * -1;
    });

    // H: Update ARIA attributes on headers after sorting
    updateAriaSort();

    return sorted;
};

const updateAriaSort = () => {
    tableHeaders.forEach(header => {
        header.setAttribute('aria-sort', 'none');

        if (header.getAttribute('data-sort') === Sort_State.field) {
            const status = Sort_State.direction === 'asc' ? 'ascending' : 'descending';
            header.setAttribute('aria-sort', status);
        }
    });
};

// Rendering the transactions
export const renderRecords = (recordsToRender, regexQuery = '') => {
    TableBody.innerHTML = '';
    const regex = compileRegex(regexQuery);

    if (recordsToRender.length === 0) {
        TableBody.innerHTML = '<tr><td colspan="5">No records found.</td></tr>'
        return;
    }

    let htmlContent = '';

    recordsToRender.forEach(record => {
        const formatAmount = (amount) => {
            const sign = amount < 0 ? 'Expense: ' : 'Income: ';
            return sign + Math.abs(amount).toFixed(2);
        };

        const descriptionHTML = highlight(record.description, regex);

        htmlContent += `
            <tr>
                <td>${record.date}</td>
                <td>${descriptionHTML}</td> 
                <td>${record.category}</td>
                <td data-amount="${record.amount}">${formatAmount(record.amount)}</td>
                <td>
                    <button data-id="${record.id}" data-action="edit">Edit</button>
                    <button data-id="${record.id}" data-action="delete">Delete</button>
                </td>
            </tr>
        `;
    });

    TableBody.innerHTML = htmlContent;
};

// This constant updates the dashboard
const updateCapStatus = (totalExpense, cap) => {
    if (!cap || cap <= 0) {
        targetStatus.textContent = 'The Budget Cap has not been set. Please set one in Settings.';
        targetStatus.setAttribute('aria-live', 'polite');
        return;
    }

    const remaining = cap - totalExpense;
    if (remaining >= 0) {
        targetStatus.textContent = `You have $${remaining.toFixed(2)} remaining in your budget.`
        targetStatus.setAttribute('aria-live', 'polite')
    } else {
        const overbudget = Math.abs(remaining).toFixed(2);
        targetStatus.textContent = `ALERT! Note that you are over budget by $${overbudget}!`
        targetStatus.setAttribute('aria-live', 'assertive')
    }
};

export const updateDashboard = () => {
    const data = state.getData()
    const settings = state.getSettings()

    let sumIncome = 0
    let sumExpense = 0
    let netBalance = 0
    const categoryTotals = {}
    let last7DaysSpending = 0

    // First getting the start date for the last 7 days
    const SevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    data.forEach(record => {
        netBalance += record.amount;

        if (record.amount > 0) {
            sumIncome += record.amount; // Income is positive
        } else if (record.amount < 0) {
            sumExpense += Math.abs(record.amount); // Expense is negative
        }

        // Category totals should sum absolute expenses
        if (record.amount < 0) {
            const category = record.category || 'Other';
            categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(record.amount);
        }

        // Weekly trend only counts expenses
        const timestamp = new Date(record.date).getTime();
        if (record.amount < 0 && timestamp >= SevenDaysAgo) {
            last7DaysSpending += Math.abs(record.amount);
        }
    });

    let category_first = 'Not Set'
    let max_spend = -1

    for (const cat in categoryTotals) {
        if (categoryTotals[cat] > max_spend) {
            max_spend = categoryTotals[cat]
            category_first = cat
        }
    }
    totalExpense.textContent = `${sumExpense.toFixed(2)}`;
    totalIncome.textContent = `${sumIncome.toFixed(2)}`;
    balance.textContent = `${netBalance.toFixed(2)}`;
    topCategory.textContent = category_first;

    if (trendChart) {
        const h3 = trendChart.querySelector('h3');
        if (h3) h3.textContent = `This is your Weekly Trend: $${last7DaysSpending.toFixed(2)}`;
    }
    updateCapStatus(sumExpense, settings.cap)
};

export const refreshTransactions = (query = '') => {
    let data = state.getData()

    data = DataToSort(data, Sort_State.field)
    if (query) {
        const re = compileRegex(query);
        if (re) {
            data = data.filter(record => re.test(record.description))
        }
    }
    renderRecords(data, query)
};

// For the announcements
export const announce = (message, politeness = 'polite') => {
    const statusRegion = document.getElementById('import-status'); // Reusing a polite status region
    if (statusRegion) {
        statusRegion.setAttribute('aria-live', politeness);
        statusRegion.textContent = message;

        setTimeout(() => statusRegion.setAttribute('aria-live', 'polite'), 1000);
    }
};
