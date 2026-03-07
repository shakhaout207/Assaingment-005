const ALL_ISSUES_API = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const SINGLE_ISSUE_API = "https://phi-lab-server.vercel.app/api/v1/lab/issue/";
const SEARCH_ISSUE_API = "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=";

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";

let allIssues = [];
let currentTab = "all";
let currentSearchText = "";

const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const newIssueBtn = document.getElementById("newIssueBtn");

const issueCount = document.getElementById("issueCount");
const issuesContainer = document.getElementById("issuesContainer");
const loadingWrapper = document.getElementById("loadingWrapper");
const emptyState = document.getElementById("emptyState");
const tabButtons = document.querySelectorAll(".tab-btn");

const issueModal = document.getElementById("issueModal");
const modalTitle = document.getElementById("modalTitle");
const modalStatusBadge = document.getElementById("modalStatusBadge");
const modalOpenedBy = document.getElementById("modalOpenedBy");
const modalCreatedAt = document.getElementById("modalCreatedAt");
const modalLabels = document.getElementById("modalLabels");
const modalDescription = document.getElementById("modalDescription");
const modalAssignee = document.getElementById("modalAssignee");
const modalPriority = document.getElementById("modalPriority");
const closeModalBtn = document.getElementById("closeModalBtn");
const topCloseModalBtn = document.getElementById("topCloseModalBtn");

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
});

function setupEventListeners() {
  loginForm.addEventListener("submit", handleLogin);

  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  });

  newIssueBtn.addEventListener("click", () => {
    alert("New Issue button is UI-only for this assignment.");
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentTab = button.dataset.tab;
      updateActiveTab();
      applyCurrentView();
    });
  });

  closeModalBtn.addEventListener("click", () => issueModal.close());
  topCloseModalBtn.addEventListener("click", () => issueModal.close());
}

function handleLogin(event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
    loginError.classList.add("hidden");
    loginView.classList.add("hidden");
    dashboardView.classList.remove("hidden");
    fetchAllIssues();
  } else {
    loginError.classList.remove("hidden");
  }
}

async function fetchAllIssues() {
  try {
    showLoading(true);

    const response = await fetch(ALL_ISSUES_API);
    const result = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch all issues.");
    }

    allIssues = Array.isArray(result.data) ? result.data : [];
    currentSearchText = "";
    searchInput.value = "";
    applyCurrentView();
  } catch (error) {
    console.error(error);
    allIssues = [];
    renderIssues([]);
  } finally {
    showLoading(false);
  }
}

async function handleSearch() {
  const searchText = searchInput.value.trim();
  currentSearchText = searchText;

  if (!searchText) {
    fetchAllIssues();
    return;
  }

  try {
    showLoading(true);

    const response = await fetch(`${SEARCH_ISSUE_API}${encodeURIComponent(searchText)}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error("Search request failed.");
    }

    allIssues = Array.isArray(result.data) ? result.data : [];
    applyCurrentView();
  } catch (error) {
    console.error(error);
    allIssues = [];
    renderIssues([]);
  } finally {
    showLoading(false);
  }
}

function applyCurrentView() {
  let filteredIssues = [...allIssues];

  if (currentTab === "open") {
    filteredIssues = filteredIssues.filter((issue) => issue.status === "open");
  } else if (currentTab === "closed") {
    filteredIssues = filteredIssues.filter((issue) => issue.status === "closed");
  }

  issueCount.textContent = filteredIssues.length;
  renderIssues(filteredIssues);
}

function updateActiveTab() {
  tabButtons.forEach((button) => {
    button.classList.remove("active-tab");
    if (button.dataset.tab === currentTab) {
      button.classList.add("active-tab");
    }
  });
}

function showLoading(isLoading) {
  if (isLoading) {
    loadingWrapper.classList.remove("hidden");
    issuesContainer.classList.add("hidden");
    emptyState.classList.add("hidden");
  } else {
    loadingWrapper.classList.add("hidden");
    issuesContainer.classList.remove("hidden");
  }
}

function renderIssues(issues) {
  issuesContainer.innerHTML = "";

  if (!issues.length) {
    issuesContainer.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  issuesContainer.classList.remove("hidden");

  issues.forEach((issue) => {
    const card = document.createElement("div");
    card.className = `issue-card ${issue.status}`;

    card.innerHTML = `
      <div class="p-4 sm:p-5">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-2">
            <img
              src="${issue.status === "open" ? "assets/Open-Status.png" : "assets/Closed- Status .png"}"
              alt="${issue.status}"
              class="w-5 h-5 object-contain"
            />
          </div>
          <span class="priority-badge ${getPriorityClass(issue.priority)}">
            ${issue.priority}
          </span>
        </div>

        <button class="issue-title-btn" data-id="${issue.id}">
          ${escapeHTML(issue.title)}
        </button>

        <p class="issue-desc mt-3">
          ${escapeHTML(issue.description)}
        </p>

        <div class="flex flex-wrap gap-2 mt-4">
          ${issue.labels.map((label) => createLabelHTML(label)).join("")}
        </div>
      </div>

      <div class="border-t border-slate-200 px-4 sm:px-5 py-4">
        <p class="meta-text">#${issue.id} by ${escapeHTML(issue.author)}</p>
        <p class="meta-text mt-1">${formatDate(issue.createdAt)}</p>
      </div>
    `;

    const titleButton = card.querySelector(".issue-title-btn");
    titleButton.addEventListener("click", () => openIssueModal(issue.id));

    issuesContainer.appendChild(card);
  });
}

async function openIssueModal(issueId) {
  try {
    const response = await fetch(`${SINGLE_ISSUE_API}${issueId}`);
    const result = await response.json();

    if (!response.ok || !result.data) {
      throw new Error("Failed to fetch single issue.");
    }

    const issue = result.data;
    fillModalData(issue);
    issueModal.showModal();
  } catch (error) {
    console.error(error);
    alert("Unable to load issue details.");
  }
}

function fillModalData(issue) {
  modalTitle.textContent = issue.title;
  modalDescription.textContent = issue.description;

  modalStatusBadge.textContent = capitalize(issue.status);
  modalStatusBadge.className = `status-badge ${issue.status === "open" ? "status-open" : "status-closed"}`;

  modalOpenedBy.textContent = `Opened by ${issue.author}`;
  modalCreatedAt.textContent = `• ${formatDate(issue.createdAt)}`;

  modalAssignee.textContent = issue.assignee && issue.assignee.trim() ? issue.assignee : "Unassigned";
  modalPriority.textContent = capitalize(issue.priority);

  modalLabels.innerHTML = issue.labels.map((label) => createLabelHTML(label)).join("");
}

function createLabelHTML(label) {
  const normalized = label.toLowerCase().trim();
  const className = getLabelClass(normalized);
  return `<span class="label-badge ${className}">${escapeHTML(label)}</span>`;
}

function getLabelClass(label) {
  if (label === "bug") return "label-bug";
  if (label === "help wanted") return "label-help-wanted";
  if (label === "enhancement") return "label-enhancement";
  if (label === "good first issue") return "label-good-first-issue";
  if (label === "documentation") return "label-documentation";
  return "label-default";
}

function getPriorityClass(priority) {
  const normalized = (priority || "").toLowerCase();
  if (normalized === "high") return "priority-high";
  if (normalized === "medium") return "priority-medium";
  return "priority-low";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US");
}

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}