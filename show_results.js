const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id');

if (id == null || id === undefined) {
    alert("no id was given")
    let path = window.location.pathname;
    window.location = `${path.substring(0, path.lastIndexOf("/"))}/customer.html`
}

const result = window.sessionStorage.getItem(id);

if (result == null || result === undefined) {
    alert("no info for the given id")
    let path = window.location.pathname;
    window.location = `${path.substring(0, path.lastIndexOf("/"))}/customer.html`
}

document.getElementById("show-results-pack-id").innerText = id;

let results = JSON.parse(result).result;


if (results == null || results === undefined || results.length === 0) {
    alert("The package id doesn't exists")
    let path = window.location.pathname;
    window.location = `${path.substring(0, path.lastIndexOf("/"))}/customer.html`
}

const table = document.getElementById("show-results-table");
results = results.sort((a,b) => a[4] - b[4]);

for (let result of results) {

    let tr = document.createElement("tr");
    tr.style.textAlign = "left"

    let time_node = document.createElement("td");
    let timeOffsetInMS = new Date().getTimezoneOffset() * 60000;
    time_node.innerText = new Date(Number(result[4]) + timeOffsetInMS).toLocaleString();

    let loc_node = document.createElement("td");
    loc_node.innerText = result[2];

    let name_node = document.createElement("td");
    name_node.innerText = result[3];

    tr.appendChild(time_node);
    tr.appendChild(loc_node);
    tr.appendChild(name_node);

    table.appendChild(tr);
}

onClick = function() {
    let path = window.location.pathname;
    window.location = `${path.substring(0, path.lastIndexOf("/"))}/customer.html`
}


