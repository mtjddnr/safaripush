var fs = require('fs'), PushLib = require('safari-push-notifications');

module.exports = function(config, path, callback) {
/*
	try {
		var cert = fs.readFileSync('./config/push.cert.pem'),
		key = fs.readFileSync('./config/push.key.pem'),
		intermediate = fs.readFileSync('./config/AppleWWDRCA.pem');
    
		var websiteJson = PushLib.websiteJSON(
	        config.websiteName, // websiteName 
	        config.websitePushID, // websitePushID 
	        config.allowedDomains, // allowedDomains 
	        config.urlFormatString, // urlFormatString 
	        config.authenticationToken, // authenticationToken (zeroFilled to fit 16 chars) 
	        config.webServiceURL // webServiceURL (Must be https!) 
	    );
	    
		PushLib.generatePackage(
	    	websiteJson, // The object from before / your own website.json object 
			"./config/icon.iconset", // Folder containing the iconset 
		    cert, // Certificate 
		    key, // Private Key 
		    intermediate // Intermediate certificate 
		)
		.pipe(fs.createWriteStream(path))
		.on('finish', function () {
			callback(true);
		});
	} catch (e) {
		callback(false);
	}
*/

	var spnPushPackage = require('spn-push-package');

	var iconset = spnPushPackage.generateIconSet('./config/push.icon.png');
	console.log(iconset);
	
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

