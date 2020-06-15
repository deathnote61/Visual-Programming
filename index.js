const uuid = require('uuid').v4;
const electron = require('electron');
const fs = require('fs');
const {
	app,
	BrowserWindow,
	Menu,
	ipcMain
} = electron;

let todayWindow, createWindow, listWindow;
let allAppointments = [];

fs.readFile('db.json', (err, jsonAppointment) => {
    if(!err){
        const oldAppointments = JSON.parse(jsonAppointment)
        allAppointments = oldAppointments;
    }
})

app.on('ready', () => {
	todayWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		title: 'App Name Here'
	});

	todayWindow.loadURL(`file://${__dirname}/today.html`);
	todayWindow.on('closed', () => {

        const jsonAppointment = JSON.stringify(allAppointments);
        fs.writeFileSync('db.json',jsonAppointment);

		app.quit();
		todayWindow = null;
	});

	const mainMenu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(mainMenu);

	ipcMain.on('appointment:create', (event, appointment) => {
		appointment["id"] = uuid();
   	 	appointment["done"] = 0;
   	 	allAppointments.push(appointment);
		console.log(allAppointments);

		sendTodayAppointments();

		createWindow.close();
	});

	ipcMain.on('appointment:request:list', event => {
		listWindow.webContents.send('appointment:response:list', allAppointments);
	});

	ipcMain.on('appointment:request:today', event => {
		sendTodayAppointments();
		console.log('here2');
	});

	ipcMain.on('appointment:done', (event, id) => {
        allAppointments.forEach(appointment => {
            appointment.done = 1
        })
		sendTodayAppointments();
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

const sendTodayAppointments = () => {
    const today = DateFormula();
    const filtered = allAppointments.filter(
		appointment => appointment.date === today
	);

	todayWindow.webContents.send('appointment:response:today', filtered);
};

const createWindowCreator = () => {
	createWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		width: 504,
		height: 430,
		title: 'Create Appointments'
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
		width: 604,
		height: 430,
		title: 'All Appointments'
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
			label: 'New Appointment',
			click() {
				createWindowCreator();
			}
		},
		{
			label: 'All Appointments',
			click() {
				listWindowCreator();
			}
		},
		{
			label: 'Quit',
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