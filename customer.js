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
    const package_id = document.getElementById("customerPackageID").value;
    api.getPackage({package_id: package_id}).then((response) => {
        if (response == null || response === undefined || response.result == null || response.result === undefined) {
            if (response.err) {
                alert(`Error: ${response.err}`);
                document.getElementById("customerPackageID").value = null;
                return;
            } else {
                alert(`Error: ${response}`);
                return;
            }
        }

        window.sessionStorage.setItem(package_id, JSON.stringify(response));

        let path = window.location.pathname;
        window.location = `${path.substring(0, path.lastIndexOf("/"))}/show_results.html?id=${package_id}`
        
    }).catch(() => alert("error"))
}

