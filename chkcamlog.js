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

// var metaData = [];

function readFile(fileName){
	return fs.readFileSync(fileName).toString().split("\r").filter(function(x){
		return (x.length>5);
	});
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
				}
			}

			if (v.match(HAL_TOKEN[i])){
				var content = v.match(new RegExp("([A-Z]/)"+HAL_TOKEN[i]+"\\\(\\\s*(\\d+\\\s*)\\\)"));
				if(content){
					var pid = parseInt(content[2]);
					if(ret.hal.indexOf(pid)<0){
						ret.hal.push(pid);
					}
				}
			}

			if (v.match(BACKEND_TOKEN[i])){
				var content = v.match(new RegExp("([A-Z])/"+BACKEND_TOKEN[i]+"\\\(\\\s*(\\d+\\\s*)\\\)"));
				if(content){
					var pid = parseInt(content[2]);
					if(ret.backend.indexOf(pid)<0){
						ret.backend.push(pid);
					}
				}
			}
		}
	});
	return ret;
}

function parse(raw, pids){
	var metaData = [];

	console.log(pids);

	raw.forEach(function(v,i,a){
		//For app logs
		for(var j=0; j<pids.app.length; j++){
			if(v.match(new RegExp(pids.app[j]+"\\\)"))){
				metaData[i] = ['app'];

				var type = v.match(new RegExp(" ([A-Z])/"));
				metaData[i].push(type[1]);

				if(v.match(new RegExp("Show fatal error"))){
					metaData[i].push('dialog');				
				}

			}
		}

		//For hal logs
		for(var j=0; j<pids.hal.length; j++){
			if(v.match(new RegExp(pids.hal[j]+"\\\)"))){
				metaData[i] = ['hal'];

				var type = v.match(new RegExp(" ([A-Z])/"));
				metaData[i].push(type[1]);

				if(v.match(new RegExp("KPI PERF"))){
					metaData[i].push('perf');				
				}

				if(v.match(new RegExp("openCamera")) || v.match(new RegExp("closeCamera"))){
					metaData[i].push('openclose');				
				}			
			}
		}

		//For imaging server logs
		for(var j=0; j<pids.backend.length; j++){
			if(v.match(new RegExp(pids.backend[j]+"\\\)"))){
				metaData[i] = ['backend'];

				var type = v.match(new RegExp(" ([A-Z])/"));
				metaData[i].push(type[1]);

				if(v.match(new RegExp("PDAF"))){
					metaData[i].push('pdaf');				
				}
			}
		}
	})

	return metaData;
}


function print(raw, meta){
	 meta.forEach(function(v,i,a){
		if(v && v.indexOf('backend')<0 && v.indexOf('openclose')>=0){
			console.log(raw[i]);
		}
	})
}

(function main(fileName){

	var rawFile = readFile(fileName);
	var pids = findPIDs(rawFile);

	var meta = parse(rawFile, pids);

	print(rawFile, meta);
	//printError(rawFile);
	

	// console.log("Camera App PIDs:"+appPID);
	// console.log("Media Server PIDs:"+halPID);
	// console.log("Imaging Server PIDs"+backendPID);

})('test.txt')
