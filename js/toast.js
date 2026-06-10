const DEFAULT_DURATION = 3500;
const QUEUED_TOAST_KEY = "queuedToast";

function getToastContainer() {
    let container = document.getElementById("toast-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    return container;
}

export function showToast(message, type = "info", options = {}) {
    if (!message) return null;

    const container = getToastContainer();
    const toast = document.createElement("div");
    const duration = Number(options.duration || DEFAULT_DURATION);

    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("toast-show");
    });

    setTimeout(() => {
        toast.classList.remove("toast-show");
        setTimeout(() => toast.remove(), 250);
    }, duration);

    return toast;
}

export function queueToast(message, type = "info") {
    if (!message) return;

    localStorage.setItem(QUEUED_TOAST_KEY, JSON.stringify({ message, type }));
}

export function showQueuedToast() {
    try {
        const queuedToast = JSON.parse(localStorage.getItem(QUEUED_TOAST_KEY) || "null");
        localStorage.removeItem(QUEUED_TOAST_KEY);

        if (queuedToast?.message) {
            showToast(queuedToast.message, queuedToast.type || "info");
        }
    } catch {
        localStorage.removeItem(QUEUED_TOAST_KEY);
    }
}
