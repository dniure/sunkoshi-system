const { app, BrowserWindow } = require('electron');
const path = require('path');

// Use dynamic import for electron-is-dev (because it's now an ES module)
let isDev;

async function loadIsDev() {
  isDev = (await import('electron-is-dev')).default;
}

async function createWindow() {
  await loadIsDev(); // Ensure isDev is loaded before proceeding

  const win = new BrowserWindow({
    // width: 1024,
    // height: 768,

    width: 948,
    height: 710,

    resizable: false,  // Disable window resizing
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Load the correct URL depending on development or production
  win.loadURL(
    isDev 
      ? 'http://localhost:3000'  // React development server
      : `file://${path.join(__dirname, 'build/index.html')}`  // Production build
  );

  // win.webContents.openDevTools();  // Optional: Open DevTools in dev mode
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
