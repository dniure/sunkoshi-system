// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    createTempOrder: (data) => ipcRenderer.invoke('createTempOrder', data),
    updateTempOrder: (data) => ipcRenderer.invoke('updateTempOrder', data),
    fetchTempOrder: (orderNumber) => ipcRenderer.invoke('fetchTempOrder', orderNumber),
    fetchCustomerInfo: (customerID) => ipcRenderer.invoke('fetchCustomerInfo', customerID),
    updateCustomerInfo: (customerID, formData) => ipcRenderer.invoke('updateCustomerInfo', customerID, formData),
});
