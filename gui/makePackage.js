const notifier = require("node-notifier");
const path = require('path');
const fs = require('fs');
const {dialog} = require('electron').remote;
const {app} = require('electron').remote;
const remote = require('electron').remote;
let client = remote.getGlobal('client');
let packageFolder = null;

var configpath = path.join(app.getPath("userData"), "moveituser.json");
if (fs.existsSync(configpath)) {
  let config_json = JSON.parse(fs.readFileSync(configpath));
  for (setting in config_json){
    document.getElementById(setting).value = config_json[setting];
  }
}

function package() {
  var contactname = document.getElementById("contactname").value;
  var jobtitle = document.getElementById("jobtitle").value;
  var department = document.getElementById("department").value;
  var email = document.getElementById("email").value;
  var phone = document.getElementById("phone").value;
  var creator = document.getElementById("creator").value;
  var rrsda = document.getElementById("rrsda").value;
  var title = document.getElementById("title").value;
  var datefrom = document.getElementById("datefrom").value;
  var dateto = document.getElementById("dateto").value;
  var description = document.getElementById("description").value;
  if (contactname === "" || email === "" || title === ""){
    notifier.notify({"title" : "MoveIt", "message" : "Contact name, email, and transfer title are required fields."});
  } else {
    packageFolder = dialog.showOpenDialogSync({properties: ["openDirectory"]});
    if (packageFolder){
      notifier.notify({"title" : "MoveIt", "message" : "Creating transfer package..."});
      var window = remote.getCurrentWindow();
        var childWindow = new remote.BrowserWindow({ 
          parent: window, 
          modal: true, 
          show: false, 
          width: 300, 
          height: 100, 
          webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
          }
        });
        childWindow.loadURL(require('url').format({
          pathname: path.join(__dirname, 'inProgress.html'),
          protocol: 'file:',
          slashes: true
        }));
        childWindow.once('ready-to-show', () => {
          childWindow.show()
        });
      client.invoke("bag_package", contactname, jobtitle, department, email, phone, creator, rrsda, title, datefrom, dateto, description, JSON.stringify(packageFolder[0]), function(error, res, more) {
        childWindow.close();
        if (res === true){
          notifier.notify({"title" : "MoveIt", "message" : "Transfer package has been created on desktop."});
          var configblock = {"contactname": contactname, "jobtitle": jobtitle, "department": department, "email": email, "phone": phone};
          fs.writeFile(configpath, JSON.stringify(configblock), (err) => {
            if (err) throw err;
          });
        } else {
          notifier.notify({"title" : "MoveIt", "message" : "Error creating transfer package. Log added to desktop."});
          console.log(error);
        }
      });
    }
  }
}

document.getElementById("package").addEventListener("click", package);