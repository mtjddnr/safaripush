var mysql = require("mysql");
var STATUS = { OK: 200, ERROR: 500 };

module.exports = function(handlerConfig) {
	var poolCluster = require('mysql').createPoolCluster();
	for (var i = 0; i < handlerConfig.connections.length; i++) {
		poolCluster.add(handlerConfig.connections[i]);
	}
/*
	var connection = mysql.createConnection({
		host     : handlerConfig[].host,
		user     : handlerConfig[].user,
		password : handlerConfig[].password,
		port     : handlerConfig[].port
	});
*/
	return {
		status: STATUS,
		poolCluster: poolCluster,
		getConnection: function(callback) {
			poolCluster.getConnection(function (err, connection) {	
				connection.config.queryFormat = function (query, values) {
					return !values ? query : query.replace(/\:(\w+)/g, function (txt, key) { 
						return values.hasOwnProperty(key) ? this.escape(typeof values[key] == "object" ? JSON.stringify(values[key]) : values[key]) : txt;
					}.bind(this));
				};
				return callback(connection);
			});
		},
		test: function(callback) {
			this.getConnection(function(connection) {
				connection.query("SHOW DATABASES", function(error, result) {		
					connection.release();
					console.log(result);
					var result = error == null ? STATUS.OK : STATUS.ERROR;
					if (error != null) console.error(error);
					return callback(result);
				});
			});
		},
		onAddDevice: function(webId, token, body, callback) {
			this.getConnection(function(connection) {
				var fields = "(" + handlerConfig.fields.webId + ", " + handlerConfig.fields.token + ") VALUES (:webId, :token)";
				connection.query("INSERT INTO " + handlerConfig.db + "." + handlerConfig.table + " " + fields, { webId: webId, token: token }, function(error, result) {		
					connection.release();
					var result = error == null ? STATUS.OK : STATUS.ERROR;
					if (error != null) console.error(error);
					return callback(result);
				});
			});
		},
		onDeleteDevice: function(webId, token, body, callback) {
			this.getConnection(function(connection) {
				var fields = handlerConfig.fields.webId + " = :webId AND " + handlerConfig.fields.token + " = :token";
				connection.query("DELETE FROM " + handlerConfig.db + "." + handlerConfig.table + " WHERE " + fields, { webId: webId, token: token }, function(error, result) {
					connection.release();
					var result = error == null ? STATUS.OK : STATUS.ERROR;
					if (error != null) console.error(error);
					return callback(result);
				});
			});
		},
		onLog: function(webId, request, callback) {
			console.log("LOG: " + new Date() + "\t" + request.headers['x-real-ip'] + ":" + webId + " " + JSON.stringify(request.body));
			return callback(STATUS.OK);
		}
	};
};