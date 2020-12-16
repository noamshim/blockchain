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
    const location = document.getElementById("creatorLocation").value;
    api.createPackage({package_id: package_id, location: location});
}
