import * as state from "./state.js";
import { highlight, compileRegex} from "./search.js";

const MENU = {
    dashboard: document.getElementById("dashboard"),
    records: document.getElementById("records"),
    form: document.getElementById("form"),
    settings: document.getElementById("settings"),
    about: document.getElementById("about"),

}

const TableBody = document.getElementById("transactions_container");
const NavigationButton = document.getElementById("navigation-button");

let Sort_State = {field: 'date', direction: 'desc'};

export const View = (viewId) => {
    Object.values(MENU).forEach(section => section.classList.add('hidden'));

    const target = MENU[viewId];
    if (target) target.classList.remove('hidden');

    NavigationButton.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-view') === viewId) {
            button.classList.add('active');
        }
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
        let a = c[field];
        let b = d[field];

        if (field === 'amount') {
            a = parsefloat(a)
            b = parseFloat(b)
        }

        let comparison = 0
        if (a > b)
            comparison = 1;
        else if (a < b)
            comparison = -1;

        return Sort_State.direction === 'asc' ? comparison : comparison * -1;
    });
    return sorted;
};
// Rendering the the transactions
export const renderRecords = (recordsToRender, regexQuery = '') => {
    TableBody.innerHTML = '';
    const regex = compileRegex(regexQuery);

    if (recordsToRender.length === 0) {
        contentTableBody.innerHTML = '<tr><td colspan="5">No records found.</td></tr>'
        return;
    }

    let htmlContent = '';

    recordsToRender.forEach(record => {
        const formatAmount = (amount) => {
            const sign = amount < 0 ? 'Income: ' : 'Expense: '
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

    contentTableBody.innerHTML = htmlContent;
};

// Sorting, filtering and rendering the data based on the search
export const transaction_filter = (query = '') => {
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
// Elements for the Dashboard
const totalExpense = document.getElementById('total_expense');
const balance = document.getElementById('balance');
const topCategory = document.getElementById('top_category');
const trendChart = document.getElementById('weekly_trend_chart');
const targetStatus = document.getElementById('status_target');

// Updating the Spending Cap ARIS Live Message
const updateCap = (totalExpense, cap) => {
    if (!cap || cap <= 0) {
        targetStatus.textContent = 'The Budget Cap has not been set. Please set one in Settings.';
    }

    const remaining = cap - totalExpense;
    if (remaining > 0) {
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

    let totalExpense = 0
    let Balance = 0
    const categoryTotal = {}
    let last7Days = 0

    // First getting the start date for the last 7 days
    const SevendaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    data.forEach(record => {
        Balance += record.amount
        if (record.amount > 0) {
            totalExpense += record.amount

            const category = record.category || 'Other';
            categoryTotal[category] = (categoryTotal[category] || 0) + record.amount;

            const Timestamp = new Date(record.date).getTime();
            if (Timestamp >= SevendaysAgo) {
                last7Days += record.amount
            }
        }
    });

    let category_first = 'Not Set'
    let max_spend = -1

    for (const cat in categoryTotal) {
        if (categoryTotal[cat] > max_spend) {
            max_spend = categoryTotal[cat]
            category_first = cat
        }
    }
    totalExpense.textContent = `${totalExpense.toFixed(2)}`;
    balance.textContent = `${balance.toFixed(2)}`;
    topCategory.textContent = category_first;
    trendChart.style.querySelector("h3").textContent = `Last 7 Days, You have spent: $${last7Days.toFixed(2)}`;
    updateCap(totalExpense, settings.cap);
};