const electron = require("electron");

const {
    app,
    BrowserWindow, 
    Menu, 
    ipcMain
} = electron;

let todayWindow, createWindow, listWindows;

app.on('ready', ()=> {
    todayWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        title: "App Name Here"
    });

    todayWindow.loadURL(`file://${__dirname}/today.html`);
    todayWindow.on("closed", ()=> {
        app.quit();
        todayWindow = null;
    });
});