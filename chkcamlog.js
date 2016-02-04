var process = require('process');
var fs = require('fs');

var APP_TOKEN = [
	'CAM_CameraActivity'
];

var HAL_TOKEN = [
	"QCameraParameters"
];

var BACKEND_TOKEN = [
	"mm-camera"
];

var metaData = [];

function readFile(fileName){
	return fs.readFileSync(fileName).toString().split("\r");
}

function findPIDs(raw){

	var ret = {
		'app': [],
		'hal': [],
		'backend': []
	};

	raw.forEach(function(v,j,a){
		if (v.length < 5){
			return;
		}

		for(var i=0; i<APP_TOKEN.length; i++){
			if (v.match(APP_TOKEN[i])){
				var content = v.match(new RegExp("([A-Z]/)"+APP_TOKEN[i]+"\\\(\\\s*(\\d+\\\s*)\\\)"));
				if(content){
					var pid = parseInt(content[2]);
					if(ret.app.indexOf(pid)<0){
						ret.app.push(pid);
					}

					metaData[j] = {'type': 'app', 'pid':pid, 'flag':[content[1]]}
				}
			}

			if (v.match(HAL_TOKEN[i])){
				var content = v.match(new RegExp("([A-Z]/)"+HAL_TOKEN[i]+"\\\(\\\s*(\\d+\\\s*)\\\)"));
				if(content){
					var pid = parseInt(content[2]);
					if(ret.hal.indexOf(pid)<0){
						ret.hal.push(pid);
					}

					metaData[j] = {'type': 'hal', 'pid':pid, 'flag':[content[1]]}
				}
			}

			if (v.match(BACKEND_TOKEN[i])){
				var content = v.match(new RegExp("([A-Z])/"+BACKEND_TOKEN[i]+"\\\(\\\s*(\\d+\\\s*)\\\)"));
				if(content){
					var pid = parseInt(content[2]);
					if(ret.backend.indexOf(pid)<0){
						ret.backend.push(pid);
					}

					metaData[j] = {'type': 'backend', 'pid':pid, 'flag':[content[1]]}
				}
			}
		}
	});

	return ret;
}

function printError(raw){

	metaData.forEach(function(v,i,a){
		if(v && (v.flag.indexOf('E')>=0)) {
			console.log(raw[i]);
		}
	})
}

(function main(fileName){

	var rawFile = readFile(fileName);
	var pids = findPIDs(rawFile);

	printError(rawFile);
	

	// console.log("Camera App PIDs:"+appPID);
	// console.log("Media Server PIDs:"+halPID);
	// console.log("Imaging Server PIDs"+backendPID);

})('test.txt')
