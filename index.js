const uuid = require('uuid').v4;
const electron = require('electron');
const fs = require('fs');
const {
	app,
	BrowserWindow,
	Menu,
	ipcMain
} = electron;

let reservationWindow, createWindow, listWindow;
let allReservations = [];

fs.readFile('db.json', (err, jsonReservation) => {
    if(!err){
        const oldReservations = JSON.parse(jsonReservation)
        allReservations = oldReservations;
    }
})

app.on('ready', () => {
	reservationWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		title: "Rein's Reservation"
	});

	reservationWindow.loadURL(`file://${__dirname}/today.html`);
	reservationWindow.on('closed', () => {

        const jsonReservation = JSON.stringify(allReservations);
        fs.writeFileSync('db.json',jsonReservation);

		app.quit();
		reservationWindow = null;
	});

	const mainMenu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(mainMenu);

	ipcMain.on('reservation:create', (event, reservation) => {
		reservation["id"] = uuid();
		reservation["done"] = 0;
   	 	allReservations.push(reservation);
		console.log(allReservations);
		
		sendTodayReservations();

		createWindow.close();
	});

	ipcMain.on('reservation:request:list', event => {
		listWindow.webContents.send('reservation:response:list', allReservations);
	});

	ipcMain.on('reservation:request:today', event => {
		sendTodayReservations();
	});

	ipcMain.on('reservation:done', (event, id) => {
        allReservations.forEach(reservation => {
            reservation.done = 1
        })
		sendTodayReservations();
	});
});

const DateFormula = () => {
	var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
	
    return [year, month, day].join('-');
}

const sendTodayReservations = () => {
    const today = DateFormula();
    const filtered = allReservations.filter(
		reservation => reservation.date === today
	);

	reservationWindow.webContents.send('reservation:response:today', filtered);
};

const createWindowCreator = () => {
	createWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		width: 480,
		height: 650,
		title: 'Create Reservations'
	});

	createWindow.setMenu(null);
	createWindow.loadURL(`file://${__dirname}/create.html`);
	createWindow.on('closed', () => {createWindow = null});
};

const listWindowCreator = () => {
	listWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		width: 480,
		height: 650,
		title: 'All Reservations'
	});

	listWindow.setMenu(null);
	listWindow.loadURL(`file://${__dirname}/list.html`);
	listWindow.on('closed', () => {listWindow = null});
};

const menuTemplate = [
{
	label: 'File',
	submenu: [
		{
			label: 'New Reservation',
			click() {
				createWindowCreator();
			}
		},
		{
			label: 'All Reservations',
			click() {
				listWindowCreator();
			}
		},
		{
			label: 'Exit',
			accelerator: process.platform === 'darwin' ? 'Command+Q' : 'CTRL + Q',
			click() {
				app.quit();
			}
		}
	]
},
{
	label: 'View',
	submenu: [
		{
			role: 'reload'
		},
		{
			role: 'toggledevtools'
		}
	]
}
];