const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const NAME_PATTERN = /^[\p{L}\s]+$/u;
const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;

export function isValidEmail(value) {
    return EMAIL_PATTERN.test(String(value || "").trim());
}

export function showFieldError(field, message) {
    if (!field) return;

    field.setAttribute("aria-invalid", "true");

    const wrapper = field.closest(".form-field, .form-group, .file-upload");
    if (!wrapper) return;

    let error = wrapper.querySelector(".field-error");
    if (!error) {
        error = document.createElement("p");
        error.className = "field-error";
        wrapper.appendChild(error);
    }

    error.textContent = message;
}

export function clearFieldError(field) {
    if (!field) return;

    field.removeAttribute("aria-invalid");

    const wrapper = field.closest(".form-field, .form-group, .file-upload");
    const error = wrapper?.querySelector(".field-error");
    if (error) error.textContent = "";
}

export function validateEmailField(field, showToast = null, options = {}) {
    if (!field) return true;

    const shouldFocus = options.focus !== false;
    const value = field.value.trim();
    const required = field.required;

    if (!value && required) {
        const message = "Please enter your email address.";
        showFieldError(field, message);
        showToast?.(message, "error");
        if (shouldFocus) field.focus();
        return false;
    }

    if (value && !isValidEmail(value)) {
        const message = "Please enter a valid email address.";
        showFieldError(field, message);
        showToast?.(message, "error");
        if (shouldFocus) field.focus();
        return false;
    }

    clearFieldError(field);
    return true;
}

export function attachEmailValidation(scope = document, showToast = null) {
    if (!scope) return;

    scope.querySelectorAll('input[type="email"]').forEach(field => {
        field.addEventListener("invalid", event => {
            event.preventDefault();
            validateEmailField(field, showToast);
        });
        field.addEventListener("blur", () => validateEmailField(field, null, { focus: false }));
        field.addEventListener("input", () => {
            if (field.getAttribute("aria-invalid") === "true") {
                validateEmailField(field);
            }
        });
    });

    const forms = scope.matches?.("form")
        ? [scope]
        : Array.from(scope.querySelectorAll("form"));

    forms.forEach(form => {
        form.addEventListener("submit", event => {
            const invalidEmail = Array.from(form.querySelectorAll('input[type="email"]'))
                .find(field => !validateEmailField(field, showToast));

            if (invalidEmail) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);
    });
}

export function formatPersonName(value) {
    return String(value || "")
        .replace(/[^\p{L}\s]/gu, "")
        .replace(/\s{2,}/g, " ");
}

export function validateNameField(field, showToast = null, options = {}) {
    if (!field) return true;

    const shouldFocus = options.focus !== false;
    const value = field.value.trim();
    const required = field.required;

    if (!value && required) {
        const message = "Please enter a valid full name.";
        showFieldError(field, message);
        showToast?.(message, "error");
        if (shouldFocus) field.focus();
        return false;
    }

    if (value && !NAME_PATTERN.test(value)) {
        const message = "Names can contain letters and spaces only.";
        showFieldError(field, message);
        showToast?.(message, "error");
        if (shouldFocus) field.focus();
        return false;
    }

    field.value = value;
    clearFieldError(field);
    return true;
}

export function attachNameValidation(scope = document, showToast = null, selector = "[data-name-validation]") {
    if (!scope) return;

    scope.querySelectorAll(selector).forEach(field => {
        field.addEventListener("invalid", event => {
            event.preventDefault();
            validateNameField(field, showToast);
        });

        field.addEventListener("input", () => {
            const cleanedValue = formatPersonName(field.value);
            if (field.value !== cleanedValue) {
                field.value = cleanedValue;
                showFieldError(field, "Names can contain letters and spaces only.");
            } else if (field.getAttribute("aria-invalid") === "true") {
                validateNameField(field, null, { focus: false });
            }
        });

        field.addEventListener("blur", () => validateNameField(field, null, { focus: false }));
    });

    const forms = scope.matches?.("form")
        ? [scope]
        : Array.from(scope.querySelectorAll("form"));

    forms.forEach(form => {
        form.addEventListener("submit", event => {
            const invalidName = Array.from(form.querySelectorAll(selector))
                .find(field => !validateNameField(field, showToast));

            if (invalidName) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);
    });
}

export function validatePhoneField(field, showToast = null, options = {}) {
    if (!field) return true;

    const shouldFocus = options.focus !== false;
    const value = field.value.trim();
    const required = field.required;
    const digits = value.replace(/\D/g, "");

    if (!value && required) {
        const message = "Please enter a phone number.";
        showFieldError(field, message);
        showToast?.(message, "error");
        if (shouldFocus) field.focus();
        return false;
    }

    if (!value) {
        clearFieldError(field);
        return true;
    }

    if (!PHONE_PATTERN.test(value)) {
        const message = "Phone number can contain digits, spaces, +, brackets and hyphens only.";
        showFieldError(field, message);
        showToast?.(message, "error");
        if (shouldFocus) field.focus();
        return false;
    }

    if (digits.length < 7 || digits.length > 15) {
        const message = "Phone number must contain between 7 and 15 digits.";
        showFieldError(field, message);
        showToast?.(message, "error");
        if (shouldFocus) field.focus();
        return false;
    }

    field.value = value;
    clearFieldError(field);
    return true;
}

export function attachPhoneValidation(scope = document, showToast = null, selector = "[data-phone-validation]") {
    if (!scope) return;

    scope.querySelectorAll(selector).forEach(field => {
        field.addEventListener("invalid", event => {
            event.preventDefault();
            validatePhoneField(field, showToast);
        });

        field.addEventListener("input", () => {
            if (field.getAttribute("aria-invalid") === "true") {
                validatePhoneField(field, null, { focus: false });
            }
        });

        field.addEventListener("blur", () => validatePhoneField(field, null, { focus: false }));
    });

    const forms = scope.matches?.("form")
        ? [scope]
        : Array.from(scope.querySelectorAll("form"));

    forms.forEach(form => {
        form.addEventListener("submit", event => {
            const invalidPhone = Array.from(form.querySelectorAll(selector))
                .find(field => !validatePhoneField(field, showToast));

            if (invalidPhone) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);
    });
}

export function validateImageFileField(field, showToast = null, options = {}) {
    if (!field) return true;

    const shouldFocus = options.focus !== false;
    const file = field.files?.[0] || null;

    if (!file && field.required) {
        const message = "Please upload an image file.";
        showFieldError(field, message);
        showToast?.(message, "error");
        if (shouldFocus) field.focus();
        return false;
    }

    if (file && !file.type.startsWith("image/")) {
        const message = "Only image files are accepted.";
        field.value = "";
        showFieldError(field, message);
        showToast?.(message, "error");
        if (shouldFocus) field.focus();
        return false;
    }

    clearFieldError(field);
    return true;
}

export function attachImageFileValidation(scope = document, showToast = null, selector = 'input[type="file"][accept*="image"]') {
    if (!scope) return;

    scope.querySelectorAll(selector).forEach(field => {
        field.addEventListener("change", () => validateImageFileField(field, showToast, { focus: false }));
        field.addEventListener("invalid", event => {
            event.preventDefault();
            validateImageFileField(field, showToast);
        });
    });

    const forms = scope.matches?.("form")
        ? [scope]
        : Array.from(scope.querySelectorAll("form"));

    forms.forEach(form => {
        form.addEventListener("submit", event => {
            const invalidFile = Array.from(form.querySelectorAll(selector))
                .find(field => !validateImageFileField(field, showToast));

            if (invalidFile) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);
    });
}

export function formatCardNumber(value) {
    return String(value || "")
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
}

export function formatExpiry(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function formatCvc(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 3);
}

export function setupPaymentInputFormatting(form, showToast = null) {
    const cardInput = form?.querySelector('[name="cardNumber"]');
    const expiryInput = form?.querySelector('[name="expiry"]');
    const cvcInput = form?.querySelector('[name="cvc"]');

    [cardInput, expiryInput, cvcInput].forEach(input => {
        input?.addEventListener("invalid", event => {
            event.preventDefault();
            validatePaymentFields(form, showToast);
        });
    });

    cardInput?.addEventListener("input", () => {
        cardInput.value = formatCardNumber(cardInput.value);
        clearFieldError(cardInput);
    });

    expiryInput?.addEventListener("input", () => {
        expiryInput.value = formatExpiry(expiryInput.value);
        clearFieldError(expiryInput);
    });

    cvcInput?.addEventListener("input", () => {
        cvcInput.value = formatCvc(cvcInput.value);
        clearFieldError(cvcInput);
    });
}

export function validatePaymentFields(form, showToast = null) {
    const cardInput = form?.querySelector('[name="cardNumber"]');
    const expiryInput = form?.querySelector('[name="expiry"]');
    const cvcInput = form?.querySelector('[name="cvc"]');
    const cardNumber = String(cardInput?.value || "").replace(/\D/g, "");
    const expiryDigits = String(expiryInput?.value || "").replace(/\D/g, "");
    const cvc = String(cvcInput?.value || "").replace(/\D/g, "");

    if (cardNumber.length !== 16) {
        return invalidPaymentField(cardInput, "Card number must contain exactly 16 digits.", showToast);
    }

    const expiryError = getExpiryError(expiryDigits);
    if (expiryError) {
        return invalidPaymentField(expiryInput, expiryError, showToast);
    }

    if (cvc.length !== 3) {
        return invalidPaymentField(cvcInput, "Security code must contain exactly 3 digits.", showToast);
    }

    [cardInput, expiryInput, cvcInput].forEach(clearFieldError);
    return {
        valid: true,
        cardNumber,
        expiry: expiryDigits,
        cvc
    };
}

function invalidPaymentField(field, message, showToast) {
    showFieldError(field, message);
    showToast?.(message, "error");
    field?.focus();

    return {
        valid: false,
        cardNumber: "",
        expiry: "",
        cvc: ""
    };
}

function getExpiryError(expiryDigits) {
    if (!/^\d{4}$/.test(expiryDigits)) {
        return "Please enter the expiry date as MM / YY.";
    }

    const month = Number(expiryDigits.slice(0, 2));
    const year = 2000 + Number(expiryDigits.slice(2));
    const now = new Date();
    const currentYear = now.getFullYear();

    if (month < 1 || month > 12) {
        return "Please enter a valid expiry month.";
    }

    if (year < currentYear) {
        return "Expiry year cannot be earlier than the current year.";
    }

    const expiryDate = new Date(year, month, 0, 23, 59, 59);

    if (expiryDate < now) {
        return "Please enter a card that has not expired.";
    }

    return "";
}
