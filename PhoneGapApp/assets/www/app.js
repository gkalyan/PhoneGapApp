document.addEventListener("deviceready", onDeviceReady, false);
var imageURIs = new Array;
var db;
function onDeviceReady() {
	db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
	db.transaction(populateDB, errorCB);
	db.transaction(queryDB, errorCB);
}

function capturePhoto() {
	navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
		destinationType: Camera.DestinationType.DATA_URL
	}); 
}

function onSuccess(imageData) {
	var image = document.getElementById('myImage');
	image.style.display = 'block';
	image.src = "data:image/jpeg;base64," + imageData;
	var imageData = { 
			'id' : imageURIs.length + 1,
			'data' : image.src
	}
	imageURIs.push(imageData);
	db.transaction(updateDB, errorCB);
	db.transaction(queryDB, errorCB);
}

function onFail(message) {
	alert('Failed because: ' + message);
}

function populateDB(tx) {
	tx.executeSql('DROP TABLE IF EXISTS DEMO');
	tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, data BLOB)');
}

function updateDB(tx) {
	var item = _.last(imageURIs);
	console.log("Item " + item.id + "   " + item.data);
	tx.executeSql('INSERT INTO DEMO (id, data) VALUES (' + item.id + ', "' + item.data +'")');
}

function queryDB(tx) {
	tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
}

function querySuccess(tx, results) {
	var root = document.getElementById('imageDiv');
	if (root.firstChild) {
		var oldTable = root.firstChild;
		root.removeChild(oldTable);
	}
	var table = document.createElement('table');
	table.className="imageTable";
	var len = results.rows.length;
	for (var i = 0; i < len; i++) {
		console.log("Id = " + results.rows.item(i).id + " URI = " + results.rows.item(i).data);
		var row = table.insertRow(i);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		cell1.innerHTML = results.rows.item(i).id;
		cell2.innerHTML = '<img style="width: 150px; height: 150px;" class="tableImages" src="' + results.rows.item(i).data + '"/>';
	}
	root.appendChild(table);
}


function errorCB(err) {
	console.log("Error processing SQL: " + err.code);
}