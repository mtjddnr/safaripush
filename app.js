var express = require('express'),
	http = require('http'),
	body_parser = require('body-parser'),
	Promise = require('promise'),
	fs = require("fs"),
	pushPackage = require("./pushPackage.js");
	
var config = require('./config/config.json');	
	config.webId = config.pushPackage.websitePushID;

var socket = { path: config.listen, mode: 0666 };

var eventHandler = require("./event_handlers/" + config.eventHandler + ".js")(config.handlerConfig);

var app = express();
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

app.post('/v1/pushPackages/' + config.webId, function(req, res){
	var path = __dirname + "/temp/" + config.webId + ".pushPackage.zip";
	if (fs.existsSync(path) == true) {
		res.set({ 'Content-type': 'application/zip' });
		return res.sendFile(path);	
	}
	pushPackage(config.pushPackage, path, function(success) {
		if (success) {
			res.set({ 'Content-type': 'application/zip' });
	    	return res.sendFile(path);
    	}
		res.sendStatus(500);
	});
});
app.post('/v1/devices/:token/registrations/' + config.webId, addDevice);
app.post('/v1/devices/:token/registrations/' + config.webId + '/delete', deleteDevice);
app.delete('/v1/devices/:token/registrations/' + config.webId, deleteDevice);

function addDevice(req, res) {
	eventHandler.onAddDevice(config.webId, req.params.token, req.body, function(result) {
		res.sendStatus(result);
	});
}
function deleteDevice(req, res) {
	eventHandler.onDeleteDevice(config.webId, req.params.token, req.body, function(result) {
		res.sendStatus(result);
	});
}

app.post('/v1/log', function(req, res){
	//console.log(new Date() + "\t" + req.method + " " + req.url + " " + req.body.logs[0]);
	eventHandler.onLog(config.webId, req, function(result) {
		res.sendStatus(result);
	});
});

app.get('/v1/script/:webId.js', function(req, res) {
	var path = __dirname + "/temp/" + req.params.webId + ".script.js";
	if (fs.existsSync(path) == false) {
		var data = fs.readFileSync(__dirname + "/resource/script_template.js", { encoding: "utf-8" });
		data = data.split("${webId}").join(req.params.webId);
		data = data.split("${host}").join(config.host);
		fs.writeFileSync(path, data, { encoding: "utf-8" });
	}
	res.sendFile(path);
});

//Start Server
function checkSocket() {
	return new Promise(function(resolve, reject) { 
		fs.exists(socket.path, function(exists) { 
			if (exists == false) return resolve();
			fs.unlink(socket.path, function(error) { 
				return error == null ? resolve() : reject("Socket Error:" + socket.path + ", " + error); 
			});
		});
	});
}

function testHandler() {
	return new Promise(function(resolve, reject) {
		eventHandler.test(function(result) { return result == eventHandler.status.OK ? resolve() : reject("Event Handler Test failed."); });
	});
}

function runServer() {
	return new Promise(function(resolve, reject) {
		http.Server(app).listen(socket.path, function(error) { return error == null ? resolve() : reject(error); });
	});
}
function pathPermission() {
	return new Promise(function(resolve, reject) {
		fs.chmod(socket.path, socket.mode, function(err) { return err == null ? resolve() : reject(err); });
	});
}

checkSocket()
.then(testHandler)
.then(runServer)
.then(pathPermission)
.then(function() { console.log(new Date() + '\tPush RESTful SAPN server started on ' + socket.path); })
.catch(function(err) {
	console.error(err);
	process.exit(0);
});


