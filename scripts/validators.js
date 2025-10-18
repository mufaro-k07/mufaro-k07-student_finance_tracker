export const REGEX_PATTERNS = {
    description: {
        pattern: /^\S(?:.*\S)?$/,
        error: "Description cannot have leading or trailing spaces."
    },
    amount: {
        pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
        error: "Amount must be a positive number with two decimal places."
    },
    date: {
        pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        error: "Date must be in YYYY-MM-DD format."
    },
    category: {
        pattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
        error: "Category can only contain letters, spaces, and hyphens."
    },
    duplicates: {
        pattern: /\b(\w+)\s+\1\b/i,
        error: "Description contains duplicate consecutive words."
    }
};

// Validating the input values against the regex patterns
export const Valid = (type, value) => {
    const match = REGEX_PATTERNS[type];

    if(!match) {
        return "Regex validation has not been configured.";
    }

    // Changing the value for testing
    const val = String(value); // don’t trim if you want to *catch* leading/trailing; trim only after normalizing
    if (!match.pattern.test(val)) {
        return match.error
    }

    // The advanced regex checker for the duplicate words
    if (type === 'description' && REGEX_PATTERNS.duplicates.pattern.test(val)) {
        return REGEX_PATTERNS.duplicates.error;
    }
    return null;
};
