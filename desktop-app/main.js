const { app, BrowserWindow, ipcMain, globalShortcut  } = require('electron');
const path = require('path');
const axios = require('axios');
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
      preload: path.join(__dirname, 'preload.js'), // Add preload script here
      nodeIntegration: false,       // Disable node integration
      enableRemoteModule: false,    // Disable remote module access
      contextIsolation: true,       // Enable context isolation
      sandbox: true                 // Enable sandboxing      
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

// ***************************************************************
ipcMain.handle('createTempOrder', async (event, dataInput) => {
    try {
      const response = await axios.post('http://localhost:3001/tempOrders', dataInput);      
      return response.data;
    } catch (error) {
      console.error('Error creating temp order:', error);     // Log the error details
      throw error;
    }
});


ipcMain.handle('fetchTempOrder', async (event, orderNumber) => {
    try {
      const response = await axios.get(`http://localhost:3001/tempOrders/${orderNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching temp order:', error);
      throw error; // Handle the error accordingly
    }
});

ipcMain.handle('updateTempOrder', async (event, data) => {
  try {
      const response = await axios.put(`http://localhost:3001/tempOrders/${data.orderDetails.orderNumber}`, data);      
      return response.data;
  } catch (error) {
      console.error('Error updating temp order:', error);
      throw error; // Handle the error accordingly
  }
});

ipcMain.handle('fetchCustomerInfo', async (event, customerID) => {
    try {
        const response = await axios.get(`http://localhost:3001/customers/${customerID}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching customer info:', error);
        throw error; // Handle the error accordingly
    }
});

ipcMain.handle('updateCustomerInfo', async (event, customerID, customerDetails) => {
    try {
        const response = await axios.put(`http://localhost:3001/customers/${customerID}`, customerDetails); // Assuming customerID is part of customerData
        return response.data;
    } catch (error) {
        console.error('Error updating customer info:', error);
        throw error; // Handle the error accordingly
    }
});

// *****************************************************
app.whenReady().then(() => {
  createWindow(1); // Default scale factor is 1

  // Register a global shortcut to manually refresh the window
  globalShortcut.register('CmdOrCtrl+R', () => {
    if (win) {
      win.reload();
    }
  });
});

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


