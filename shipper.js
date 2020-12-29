const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id');

if (id != null) {
    document.getElementById("shipperPackageId").value = id;
} else {
    var html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess);
}

const api = createApiClient();

function onSubmit() {
    const package_id = document.getElementById("shipperPackageId").value;
    const location = document.getElementById("shipperLocation").value;
    const name = document.getElementById("shipperName").value;
    let time = Date.now();
    let timeOffsetInMS = new Date().getTimezoneOffset() * 60000;
    time = time - timeOffsetInMS;
    
    api.updatePackage({package_id: package_id, location: location, name:name, time:time})
    .then((response) => {
        if (response.msg) {
            alert(response.msg);
        } else if (response.err) {
            alert(response.err);
        } else {
            alert('error')
        }
        let path = window.location.pathname;
        window.location = `${path.substring(0, path.lastIndexOf("/"))}/shipper.html`
    }).catch(() => alert('error'));
}

function onScanSuccess(qrCodeMessage) {
    // let path = window.location.pathname;
    window.location = qrCodeMessage;
}