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
    console.log(package_id)
    api.getPackage({package_id: package_id}).then((response) => {
        if (response == null || response === undefined || response.result == null || response.result === undefined) {
            console.log("error:", response);
            return;
        }
        
        let path = window.location.pathname;

        window.location = `${path.substring(0, path.lastIndexOf("/"))}/show_results.html`
        
    })
}
