var fs = require('fs');
var spnPushPackage = require('spn-push-package');

module.exports = function(config, path, callback) {

	var iconset = spnPushPackage.generateIconSet('./config/push.icon.png');
	
	var zipStream = spnPushPackage.generate({
	  websiteJSON: config,
	  iconset: iconset,
	  key: './config/push.key.pem',
	  keyPass: '',
	  cert: './config/push.cert.pem'
	});
	
	zipStream.pipe(fs.createWriteStream(path, {flags: 'w'})).on('finish', function () {
		callback(true);
	});
};

