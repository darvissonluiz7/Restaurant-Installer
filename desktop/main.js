const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

// ── Config ──────────────────────────────────────────────────────────────
// Em dev usa localhost, em produção usa a URL do Railway
const BASE_URL =
  process.env.RESTOPRO_URL || "http://localhost:5174";

const ADMIN_URL = `${BASE_URL}/admin/login`;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "RestoPro — Painel Admin",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    titleBarStyle: "hiddenInset", // macOS: barra de título integrada
    backgroundColor: "#ffffff",
  });

  // Remove menu bar (cleaner look)
  Menu.setApplicationMenu(null);

  // Load the admin page
  win.loadURL(ADMIN_URL);

  // Open DevTools only in development
  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }

  // Set window title dynamically
  win.webContents.on("page-title-updated", (event) => {
    event.preventDefault();
    win.setTitle("RestoPro — Painel Admin");
  });
}

// ── App lifecycle ───────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // macOS: re-create window when dock icon clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
