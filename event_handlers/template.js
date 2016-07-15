var STATUS = { OK: 200, ERROR: 500 };

module.exports = function(handlerConfig) {
	return {
		test: function(callback) {
			//Testing module
			return callback(STATUS.OK);
		},
		onAddDevice: function(webId, token, body, callback) {
			//register Device Token
			return callback(STATUS.OK);
		},
		onDeleteDevice: function(webId, token, body, callback) {
			//unregister device Token
			return callback(STATUS.OK);
		},
		onLog: function(webId, request, callback) {
			console.log("LOG: " + new Date() + "\t" + header['x-real-ip'] + ":" + webId + " " + JSON.stringify(request.body));
			return callback(STATUS.OK);
		}
	};
};