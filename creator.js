// const { get } = require("request");
// var requirejs = require('requirejs');

// requirejs.config({
//     //Pass the top-level main.js/index.js require
//     //function to requirejs so that node modules
//     //are loaded relative to the top-level JS file.
//     nodeRequire: require
// });
const api = createApiClient();

function onSubmit() {
    const package_id = document.getElementById("creatorPackageId").value;
    const name = document.getElementById("creatorName").value;
    const location = document.getElementById("creatorLocation").value;
    let time = Date.now();
    let timeOffsetInMS = new Date().getTimezoneOffset() * 60000;
    time = time - timeOffsetInMS;
    api.createPackage({package_id: package_id, location: location, name: name, time: time})
    .then((response) => {
        if (response.msg) {
            generateBarCode(response.msg);
        } else if (response.err) {
            alert(response.err);
        } else {
            alert('error')
        }
        document.getElementById("creatorPackageId").value = null;
        document.getElementById("creatorName").value = null;
        document.getElementById("creatorLocation").value = null;
    }).catch(() => alert('error'));
}

function generateBarCode(hashed_id)
{
    let path = window.location.pathname;
    const package_id = document.getElementById("creatorPackageId").value;
    var nric = `${path.substring(0, path.lastIndexOf("/"))}/shipper.html?id=${hashed_id}`;
    
    let qr = document.createElement("img");
    qr.id = 'barcode';
    qr.src='https://api.qrserver.com/v1/create-qr-code/?data=' + nric + '&amp;size=50x50';
    qr.alt="";
    qr.width="50";
    qr.height="50";
    qr.style.borderStyle = "none";
    qr.style.position = "absolute";
    qr.style.left = "0";
    qr.style.right = "0";
    qr.style.bottom = "0";
    qr.style.top = "0";
    qr.style.margin = "auto";
    qr.style.width ="50%";
    qr.style.height = "50%";
    qr.style.padding = "20px";


    let div = document.createElement("div");
    div.style.position="fixed"
    div.style.width="100%"
    div.style.height="100%"
    div.style.top = "0";
    div.style.left = "0";
    div.style.zIndex = "100"
    div.style.background = "#f8f9fa";
    div.style.textAlign = "center";
    div.appendChild(qr);

    let button = document.createElement("button");
    button.className="button button2";
    button.innerText="Back";
    button.style.position = "absolute";
    button.style.display = "block";
    button.style.margin = "auto";
    button.style.bottom="5%";
    button.style.width="50%";
    button.style.left= "0";
    button.style.right= "0";
    button.onclick=() => onClick();
    div.appendChild(button);

    let main = document.getElementById('creator-main');
    main.appendChild(div);
}

onClick = function() {
    let path = window.location.pathname;
    window.location = `${path.substring(0, path.lastIndexOf("/"))}/creator.html`
}