var os = require('os');
var cp = require('child_process'); 
var process = require('process');
var fs = require('fs');

var ADB = "/automount/suntools/Ubuntu/adb";
var TMP_FILE = "/tmp/~camLaunchLog.txt";
var cmdClearLog = "rm -rf "+TMP_FILE;
var APK_PKG = 'com.tct.camera';

var ADB_WIN = "adb.exe";
var TMP_FILE_WIN = 'D:/camLaunchLog.txt';
var cmdClearLog_WIN = "del "+TMP_FILE;

if(os.type().indexOf('Windows') >= 0){
	ADB = ADB_WIN;
	TMP_FILE = TMP_FILE_WIN;
	cmdClearLog = cmdClearLog_WIN;
}

function check_property(label, property, hint, cb){
	var cmd = ADB+" shell getprop "+property+">"+TMP_FILE;
	cp.exec(cmd).on('exit',function(){
		var content = fs.readFileSync(TMP_FILE).toString().trim();
		cb(label, content, hint);
	})
}

function check_dumpsys(label){
	var value;
	DUMPSYS_INFO.forEach(function(v,i,a){
		if(v.indexOf(label) >= 0){
			var regex = new RegExp(label+":\\s+(\\S+)")
			var res = v.match(regex);
			if(res)
				value = res[1];
		}
	})
	return value;
}

//For main
function check_product(cb){
	check_property("Product", "def.tctfw.brandMode.name", null, cb);
}

function check_baseline(cb){
	check_property("Baseline", "gsm.version.baseband", null, cb);
}

function check_hw(cb){
	check_property("Hardware", "ro.def.hardware.version", null, cb);
}

function check_sw(cb){
	check_property("Software", "ro.tct.sys.ver", null, cb);
}

function check_perf(cb){
	check_property("KernelBuild", "ro.tct.kernelconfig", "Performance", cb);
}

function check_apk(cb){
	var cmd = ADB+" shell pm dump "+APK_PKG+">"+TMP_FILE;
	cp.exec(cmd).on('exit',function(){
		var content = fs.readFileSync(TMP_FILE).toString();
		content = content.split("\r\n");
		var versionNo = "";
		content.forEach(function(v,i,a){
			if(v.indexOf('versionName') >= 0){
				var regex = new RegExp("versionName=")
				var res = v.match(/versionName=(\S+)/);
				versionNo = res[1];
			}
		});
		cb(APK_PKG, versionNo);
	})	
}


//For Camera App
function check_zsl(cb){
	cb("ZSL", check_dumpsys("zsl"), "on");
}

function check_antibanding(cb){
	cb("Anti-Banding", check_dumpsys("antibanding"), "auto");
}

function check_autoexposure(cb){
	cb("Auto-Exposure", check_dumpsys("auto-exposure"), "central-weight");
}

function check_picturesize(cb){
	cb("Picture-Size", check_dumpsys("picture-size"));
}

function check_previewsize(cb){
	cb("Preview-Size", check_dumpsys("preview-size"));
}

function check_face(cb){
	cb("Face-Detection", check_dumpsys("face-detection"), "on");
}

//For HAL
function check_hal_zsl(cb){
	var result = check_dumpsys("Is ZSL Mode");
	if (result == '1'){
		result = 'ON'
	}
	else {
		result = "OFF"
	}
	cb("ZSL", result, "ON");
}

function check_hal_histo(cb){
	var result = check_dumpsys("isHistogramEnabled");
	if (result == '1'){
		result = 'ON'
	}
	else {
		result = "OFF"
	}
	cb("Histogram", result, "ON");
}

function check_hal_face(cb){
	var result = check_dumpsys("isFaceDetectionEnabled");
	if (result == '1'){
		result = 'ON'
	}
	else {
		result = "OFF"
	}
	cb("Face-Detection", result);
}

function check_hal_wnr(cb){
	var result = check_dumpsys("Is WNR Enabled");
	if (result == '1'){
		result = 'ON'
	}
	else {
		result = "OFF"
	}
	cb("WNR", result, "ON");	
}

function check_hal_focus(cb){
	var result = parseInt(check_dumpsys("getFocusMode"));
	var labels = [
	'OFF',
    'AUTO',
    'INFINITY',
    'MACRO',
    'FIXED',
    'EDOF',
    'CONTINOUS_VIDEO',
    'CONTINOUS_PICTURE',
	];
	cb("Focus-Mode", labels[result]);
}

function check_hal_antibanding(cb){
	var result = parseInt(check_dumpsys("getAutoFlickerMode"));
	var labels = [
    'OFF',
    '60HZ',
    '50HZ',
    'AUTO',
    'AUTO_50HZ',
    'AUTO_60HZ',
	];
	cb("Anti-Banding", labels[result], "AUTO");
}

//Check Debug
function check_dbg_mobicat(cb){
	check_property("EXIF Dump", "persist.camera.mobicat", "ISP+3A", function(label, content, hint){
		var val = parseInt(content);

		if(val == 3){
			content = "ISP+3A";
		}
		else if(val == 2){
			content = "3A";
		}
		else if(val == 1){
			content = "ISP";
		}
		else {
			content = "None";
		}
		cb(label, content, hint);
	})
}

function check_dbg_dumpexif(cb){
	check_property("3A Exif", "persist.camera.stats.debugexif", "3080192", cb);
}


function checkcb_main(key, value, hint){
	if(hint && typeof(hint)=='string' && hint.length > 0){
		console.log("["+key+"]"+"    "+value+" (="+hint+"?)");
	}
	else{
		console.log("["+key+"]"+"    "+value);
	}

	if(CHECK_LIST_MAIN.length>0){
		(CHECK_LIST_MAIN.shift())(checkcb_main);
	}
	else{
		check_camera_app();
	}
}

function check_main(){
	console.log("-----Main-----");
	if(CHECK_LIST_MAIN.length>0){
		(CHECK_LIST_MAIN.shift())(checkcb_main);
	}	
	else {
		check_camera_app();
	}
}

function checkcb_camera_app(key, value, hint){
	if(hint && typeof(hint)=='string' && hint.length > 0){
		console.log("["+key+"]"+"    "+value+" (="+hint+"?)");
	}
	else{
		console.log("["+key+"]"+"    "+value);
	}

	if(CHECK_LIST_CAMERA_APP.length>0){
		(CHECK_LIST_CAMERA_APP.shift())(checkcb_camera_app);
	}
	else {
		check_hal();
	}
}

function check_camera_app(){
	console.log("");
	console.log("-----Camera App-----");

	var startCamera = ADB+" shell am start "+APK_PKG;

	cp.exec(startCamera).on('exit', function(){ //start camera
		setTimeout(function(){
			var paramDump = ADB+" shell dumpsys media.camera >"+TMP_FILE;
			cp.exec(paramDump).on('exit', function(){ //dumpsys media.camera after 3 sec
				var content = fs.readFileSync(TMP_FILE).toString();

				//trim shim
				DUMPSYS_INFO = content.split("\r\n");

				while(DUMPSYS_INFO.length > 0){
					if (DUMPSYS_INFO[0].indexOf('Client priority level')>=0){
						break;
					}
					else{
						DUMPSYS_INFO.shift();
					}
				}

				for(var ii=0; ii<DUMPSYS_INFO.length; ii++){
					if(DUMPSYS_INFO[ii].indexOf('API shim')>=0){
						DUMPSYS_INFO = DUMPSYS_INFO.slice(0,ii-1);
						break;
					}
				}

				if(CHECK_LIST_CAMERA_APP.length>0){
					(CHECK_LIST_CAMERA_APP.shift())(checkcb_camera_app);
				}
			});
		}, 3000);
	})
}

function checkcb_hal(key, value, hint){
	if(hint && typeof(hint)=='string' && hint.length > 0){
		console.log("["+key+"]"+"    "+value+" (="+hint+"?)");
	}
	else{
		console.log("["+key+"]"+"    "+value);
	}

	if(CHECK_LIST_HAL.length>0){
		(CHECK_LIST_HAL.shift())(checkcb_hal);
	}
	else{
		check_dbg();
	}
}

function check_hal(){
	console.log("");
	console.log("-----HAL-----");
	if(CHECK_LIST_HAL.length>0){
		(CHECK_LIST_HAL.shift())(checkcb_hal);
	}		
	else{
		check_dbg();
	}
}

function checkcb_dbg(key, value, hint){
	if(hint && typeof(hint)=='string' && hint.length > 0){
		console.log("["+key+"]"+"    "+value+" (="+hint+"?)");
	}
	else{
		console.log("["+key+"]"+"    "+value);
	}

	if(CHECK_LIST_DEBUG.length>0){
		(CHECK_LIST_DEBUG.shift())(checkcb_dbg);
	}
}

function check_dbg(){
	console.log("");
	console.log("-----DBG_INFO-----");
	if(CHECK_LIST_DEBUG.length>0){
		(CHECK_LIST_DEBUG.shift())(checkcb_dbg);
	}			
}

var CHECK_LIST_MAIN = [
	check_product,
	check_baseline,
	check_hw,
	check_sw,
	check_perf,
	check_apk
];

var CHECK_LIST_CAMERA_APP = [
	check_zsl,
	check_antibanding,
	check_autoexposure,
	check_picturesize,
	check_previewsize,
	check_face
];

var CHECK_LIST_HAL = [
	check_hal_zsl,
	check_hal_histo,
	check_hal_face,
	check_hal_wnr,
	check_hal_antibanding,
	check_hal_focus

];

var CHECK_LIST_DEBUG = [
	check_dbg_mobicat,
	check_dbg_dumpexif
];

var DUMPSYS_INFO;

(function main(){
	check_main();
})();