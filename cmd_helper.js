var os = require('os');
var cp = require('child_process'); 
var fs = require('fs');

//To config here
var ADB = "/automount/suntools/Ubuntu/adb";
var TMP_FILE = "/tmp/~camLaunchLog.txt";

var ADB_WIN = "adb.exe";
var TMP_FILE_WIN = 'D:/camLaunchLog.txt';

var APK_PKG = 'com.tct.camera';

if(os.type().indexOf('Windows') >= 0){
	ADB = ADB_WIN;
	TMP_FILE = TMP_FILE_WIN;
}


var cmd_helper = {};

cmd_helper.adb = function(cmd){
	return cp.exec(ADB+" "+cmd);
}

cmd_helper.adbLog = function(file){
	return cp.exec(ADB+" logcat -v threadtime>"+file);
}

cmd_helper.adbclear = function(){
	return cp.exec(ADB+" logcat -c");
}

cmd_helper.rmFile = function(file){
	if(os.type().indexOf('Windows') >= 0){
		return cp.exec("del "+file);
	}
	else {
		return cp.exec("rm "+file);
	}
}

module.exports = cmd_helper;