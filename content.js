let userMessages = [];
let sidebarCreated = false;
let timeout = null;

function createSidebar() {
    if (sidebarCreated) return;
    const sidebar = document.createElement("div");
    sidebar.id = "chatgpt-nav";
    document.body.appendChild(sidebar);
    sidebarCreated = true;
}

function collectMessages() {
    // Specifically target the user message blocks
    const messages = document.querySelectorAll('[data-message-author-role="user"]');
    userMessages = Array.from(messages).map((msg, index) => ({
        id: index + 1,
        text: msg.innerText,
        element: msg
    }));
    renderSidebar();
}

function renderSidebar() {
    const sidebar = document.getElementById("chatgpt-nav");
    if (!sidebar) return;
    sidebar.innerHTML = "";

    userMessages.forEach(msg => {
        const btn = document.createElement("div");
        btn.className = "nav-item";
        btn.innerText = msg.id;

        btn.addEventListener("mouseenter", () => showTooltip(btn, msg.text));
        btn.addEventListener("mouseleave", hideTooltip);

        btn.onclick = () => {
            // Changed "center" to "start" to align your query at the top
            msg.element.scrollIntoView({
                behavior: "smooth",
                block: "start" 
            });
        };

        sidebar.appendChild(btn);
    });
}

function showTooltip(element, text) {
    let tooltip = document.getElementById("chatgpt-tooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "chatgpt-tooltip";
        document.body.appendChild(tooltip);
    }

    // Clean "You" or "You said" if ChatGPT includes it in innerText
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

createSidebar();
collectMessages();

const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(collectMessages, 800);
});

observer.observe(document.body, { childList: true, subtree: true });