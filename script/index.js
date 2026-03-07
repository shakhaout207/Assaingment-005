const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";

const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

document.addEventListener("DOMContentLoaded", () => {
  loginForm.addEventListener("submit", handleLogin);
});

function handleLogin(event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
    loginError.classList.add("hidden");
    loginView.classList.add("hidden");
    dashboardView.classList.remove("hidden");
  } else {
    loginError.classList.remove("hidden");
  }
}