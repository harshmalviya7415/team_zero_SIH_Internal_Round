const fs = require("fs");
const path = require("path");
const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const frontendDist = path.join(__dirname, "frontend", "dist", "index.html");
  const rootIndex = path.join(__dirname, "index.html");

  win.loadURL("http://localhost:5173");

  win.webContents.on("did-fail-load", () => {
    if (fs.existsSync(frontendDist)) {
      win.loadFile(frontendDist);
      return;
    }

    if (fs.existsSync(rootIndex)) {
      win.loadFile(rootIndex);
    }
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
