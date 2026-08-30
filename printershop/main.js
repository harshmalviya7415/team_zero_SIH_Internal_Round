const fs = require("fs");
const path = require("path");
const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
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

const { ipcMain } = require("electron");
const { printCloudinaryPdf } = require("./printService");

ipcMain.on("print_document", async (event, data) => {
  console.log("IPC print_document event received:", data);
  try {
    await printCloudinaryPdf(data.url, data.settings);
    console.log("Silent printing completed successfully.");
    event.reply("print_completed", { jobId: data.jobId, success: true });
  } catch (error) {
    console.error("Silent printing failed:", error);
    event.reply("print_completed", { jobId: data.jobId, success: false, error: error.message });
  }
});
