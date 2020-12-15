"use strict";

if(require('electron-squirrel-startup')) return;
require('update-electron-app')();
const {app, dialog, nativeImage, shell, Tray, Menu, BrowserWindow} = require("electron");
const notifier = require("node-notifier");
const zerorpc = require("zerorpc");
global.client = new zerorpc.Client({"timeout": 3600, "heartbeatInterval": 3600000});
const portfinder = require("portfinder");
const fs = require('fs');

const path = require('path')
const PY_MOVEIT_FOLDER = 'moveit'
const PY_FOLDER = '..'
const PY_MODULE = 'moveit'

let pythonChild = null
let mainWindow = null

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const guessPackaged = () => {
  const fullPath = path.join(__dirname, PY_MOVEIT_FOLDER)
  return require('fs').existsSync(fullPath)
}

const getScriptPath = () => {
  if (!guessPackaged()) {
    return path.join(__dirname, PY_FOLDER, PY_MODULE + '.py')
  }
  if (process.platform === 'win32') {
    return path.join(__dirname, PY_MOVEIT_FOLDER, PY_MODULE + '.exe')
  }
  return path.join(__dirname, PY_MOVEIT_FOLDER, PY_MODULE)
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 550,
    height: 700,
    backgroundColor: "#D6D8DC",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });

  if (app.dock) { app.dock.show() };

  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(require('url').format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('close', (event) => {
    if (mainWindow != null){
      mainWindow.hide();
    }
    mainWindow = null
  });
}


app.on('ready', () => {
  createWindow();
})

portfinder.basePort = 4242;
let port = portfinder.getPort(function (err, port) {
  client.connect("tcp://127.0.0.1:" + String(port));
  const createMoveIt = () => {
    let script = getScriptPath()
    if (guessPackaged()) {
      pythonChild = require('child_process').spawn(script, [port])
    } else {
      pythonChild = require('child_process').spawn('python3', [script, port])
    }

    if (pythonChild != null) {
      console.log('Python started successfully');

      pythonChild.stdout.on('data', function (data) {
        console.log(data.toString());
      });

      pythonChild.stderr.on('data', function (data) {
        console.log(data.toString());
      });
    }
  }

  app.on('ready', createMoveIt);
});

const exitMoveIt = () => {
  pythonChild.kill()
  pythonChild = null
  global.client.close();
}

app.on("before-quit", ev => {
  if (mainWindow != null){
    mainWindow.close();
  }
  top = null;
});

app.on('will-quit', ev => {
  exitMoveIt();
  app.quit();
})

if (process.argv.slice(-1)[0] === '--run-tests') {
  sleep(2000).then(() => {
    const total_tests = 1
    let tests_passing = 0
    let failed_tests = []

    if (pythonChild != null) {
      tests_passing++;
    } else {
      failed_tests.push('spawn_python');
    }

    console.log(`of ${total_tests} tests, ${tests_passing} passing`);

    if (tests_passing < total_tests) {
      console.error(`failed tests: ${failed_tests}`);  
    }

    app.quit();
  });
};

let top = {};