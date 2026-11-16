console.log("ChatGPT Scroll Navigator loaded!");

let timeout = null;
let activeIndex = null;

function createSidebar() {
    let sidebar = document.getElementById("chatgpt-nav");
    if (!sidebar) {
        sidebar = document.createElement("div");
        sidebar.id = "chatgpt-nav";
        document.body.appendChild(sidebar);
    }
    sidebar.style.display = "flex"; // Always keep container visible so you know it's injected!
    return sidebar;
}

function collectMessages() {
    const sidebar = createSidebar();

    // Broader fallback selectors for ChatGPT messages
    let rawMessages = document.querySelectorAll('[data-message-author-role="user"]');
    if (rawMessages.length === 0) {
        rawMessages = document.querySelectorAll('div[data-message-author-role="user"], article div.text-message, div[dir="auto"]');
    }
    
    const userMessages = [];
    let counter = 1;

    rawMessages.forEach(msg => {
        // Skip inputs, textareas, and typing boxes
        if (msg.closest('form') || msg.closest('div[contenteditable="true"]') || msg.closest('textarea')) return;

        const text = msg.innerText || msg.textContent;
        // Filter out tiny or empty helper text
        if (text && text.trim().length > 2 && !userMessages.some(m => m.element === msg)) {
            userMessages.push({
                id: counter++,
                text: text,
                element: msg
            });
        }
    });

    renderSidebar(userMessages);
}

function renderSidebar(userMessages) {
    const sidebar = createSidebar();
    sidebar.innerHTML = ""; // Clear old buttons

    if (userMessages.length === 0) {
        // Show a placeholder dot so you know the extension is active even on empty chats
        const placeholder = document.createElement("div");
        placeholder.className = "nav-item";
        placeholder.innerText = "•";
        placeholder.title = "ChatGPT Navigator Active (Waiting for your first message)";
        sidebar.appendChild(placeholder);
        return;
    }

    detectActiveMessage(userMessages);

    userMessages.forEach((msg, idx) => {
        const btn = document.createElement("div");
        btn.className = "nav-item";
        if (idx === activeIndex) {
            btn.classList.add("active");
        }
        btn.innerText = msg.id;

        btn.addEventListener("mouseenter", () => showTooltip(btn, msg.text));
        btn.addEventListener("mouseleave", hideTooltip);

        btn.onclick = () => {
            msg.element.scrollIntoView({
                behavior: "smooth",
                block: "start" 
            });
            activeIndex = idx;
            updateActiveState();
        };

        sidebar.appendChild(btn);
    });
}

function detectActiveMessage(userMessages) {
    if (userMessages.length === 0) return;
    let currentActive = 0;
    userMessages.forEach((msg, idx) => {
        const rect = msg.element.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
            currentActive = idx;
        }
    });
    activeIndex = currentActive;
}

function updateActiveState() {
    const buttons = document.querySelectorAll(".nav-item:not([title])");
    buttons.forEach((btn, idx) => {
        if (idx === activeIndex) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function showTooltip(element, text) {
    let tooltip = document.getElementById("chatgpt-tooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "chatgpt-tooltip";
        document.body.appendChild(tooltip);
    }

    const cleanText = text.replace(/You\n/i, '').trim().substring(0, 150);
    tooltip.innerText = `Your Query: ${cleanText}${text.length > 150 ? "..." : ""}`;

    const rect = element.getBoundingClientRect();
    tooltip.style.top = rect.top + "px";
    tooltip.style.left = (rect.left - 340) + "px";
    tooltip.style.display = "block";
}

function hideTooltip() {
    const tooltip = document.getElementById("chatgpt-tooltip");
    if (tooltip) tooltip.style.display = "none";
}

// Initial checks & continuous polling safety net
setTimeout(collectMessages, 1500);
setInterval(collectMessages, 3000);

// Document scroll listener
document.addEventListener("scroll", () => {
    clearTimeout(timeout);
    timeout = setTimeout(collectMessages, 200);
}, true);

// MutationObserver for chat switches
let lastUrl = location.href;
const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(collectMessages, 1000);
    }
    clearTimeout(timeout);
    timeout = setTimeout(collectMessages, 800);
});

observer.observe(document.body, { childList: true, subtree: true });