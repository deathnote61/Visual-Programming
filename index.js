const electron = require("electron");
const uuid = require("uuid").v4;
const {
    app,
    BrowserWindow, 
    Menu, 
    ipcMain
} = electron;

let welcomeWindow;
let listWindow;

let allItems = [];

app.on('ready', ()=> {
    welcomeWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        title: "Rookiezi Cashier"
    });

    welcomeWindow.loadURL(`file://${__dirname}/welcome.html`);
    welcomeWindow.on("closed", ()=> {
        app.quit();
        welcomeWindow = null;
    });

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);

});

const listWindowCreator = () => {
    listWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 600,
        height: 400,
        title: "All items"
    });

    listWindow.setMenu(null);
    listWindow.loadURL(`file://${__dirname}/list.html`);
    listWindow.on("closed", () => (listWindow = null))
};


ipcMain.on("item:create", (event, item) => {
    item["id"] = uuid();
    item["done"] = 0;
    allItems.push(item);
	console.log(allItems);
});
ipcMain.on("item:request:list", event => {
	listWindow.webContents.send('item:response:list', allItems);
});


const menuTemplate = [{
    label: "File",
    submenu: [{
        label: "All Items",
        click(){
            listWindowCreator();
        }
    },
    {
        label: "Quit",
        accelerator:process.platform == "darwin" ? "command+Q" : "Ctrl + Q",
        click(){
            app.quit();
        }
    }
]
},

{
    label: "View",
    submenu: [{ role:"reload" }, { role : "toggledevtools"}]
}
]