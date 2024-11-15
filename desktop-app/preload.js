// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    createTempOrder: (inputData) => {
        return ipcRenderer.invoke('createTempOrder', inputData)},

    fetchTempOrder: (orderNumber) => {
        return ipcRenderer.invoke('fetchTempOrder', orderNumber)},

    updateTempOrder: (inputData) => {
        return ipcRenderer.invoke('updateTempOrder', inputData)},

    fetchCustomerInfo: async (customerID) => {
        return ipcRenderer.invoke('fetchCustomerInfo', customerID)},
 
    updateCustomerInfo: async (customerID, customerDetails) => {
        const output = await ipcRenderer.invoke('updateCustomerInfo', customerID, customerDetails);
        return output;
    }
});
