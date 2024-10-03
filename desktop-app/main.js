const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let isDev;

async function loadIsDev() {
  isDev = (await import('electron-is-dev')).default;
}

let win;
async function createWindow() {
  await loadIsDev(); // Ensure isDev is loaded before proceeding

  const initialWidth = 1024;
  const initialHeight = 768;
  const aspectRatio = initialWidth / initialHeight;

  win = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    resizable: true,
    minWidth: 884,
    minHeight: 663,
    maxWidth: 1268,
    maxHeight: 951,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Set aspect ratio for the window to maintain during resizing
  win.setAspectRatio(aspectRatio);

  // Load the correct URL depending on development or production
  win.loadURL(
    isDev
      ? 'http://localhost:3000'  // React development server
      : `file://${path.join(__dirname, 'build/index.html')}`  // Production build
  );

  // Set the initial zoom factor based on the window size or a default value
  const initialScale = 1.0;
  win.webContents.setZoomFactor(initialScale);

  // Listen for scaling requests from the renderer process
  ipcMain.on('scale-window', (event, newScale) => {
    const newWidth = Math.round(initialWidth * newScale);
    const newHeight = Math.round(initialHeight * newScale);
    win.setSize(newWidth, newHeight);
    win.webContents.setZoomFactor(newScale); // Adjust the zoom factor for content scaling
    win.webContents.send('scale-content', newScale); // Notify renderer process to scale the content
  });

  // Dynamically adjust zoom when window size changes
  win.on('resize', () => {
    const [currentWidth] = win.getSize();
    const scaleFactor = currentWidth / initialWidth; // Scale based on 1024px reference width
    win.webContents.setZoomFactor(scaleFactor); // Apply zoom factor dynamically
    win.webContents.send('scale-content', scaleFactor); // Notify renderer process
  });
}

app.whenReady().then(() => createWindow(1)); // Default scale factor is 1

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(1);
  }
});
