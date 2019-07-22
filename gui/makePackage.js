const notifier = require("node-notifier");
const {dialog} = require('electron').remote;
const remote = require('electron').remote;
let client = remote.getGlobal('client');
let projectFolder = null;

function package() {
  packageFolder = dialog.showOpenDialog({properties: ["openDirectory"]});
  if (packageFolder){
    notifier.notify({"title" : "MoveIt", "message" : "Creating transfer package..."});
    var contactname = document.getElementById("contactname").value;
    var department = document.getElementById("department").value;
    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var creator = document.getElementById("creator").value;
    var rrsda = document.getElementById("rrsda").value;
    var title = document.getElementById("title").value;
    var datefrom = document.getElementById("datefrom").value;
    var dateto = document.getElementById("dateto").value;
    var description = document.getElementById("description").value;
    var metadata = document.getElementById("metadata").value;
    client.invoke("package", contactname, department, email, phone, creator, rrsda, title, datefrom, dateto, description, metadata, packageFolder, function(error, res, more) {
      if (res === true){
        notifier.notify({"title" : "MoveIt", "message" : "Transfer package has been created on desktop."});
      } else {
        notifier.notify({"title" : "MoveIt", "message" : "Error creating transfer package."})
      }
    });
  }
}

document.getElementById("package").addEventListener("click", package);