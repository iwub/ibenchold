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

var VERBOSE = false;

var cmd_helper = {};

cmd_helper._adb = function(cmd){
	return cp.exec(ADB+" "+cmd);
}

cmd_helper._cmd = function(cmd){
	return cp.exec(cmd);
}

cmd_helper._adbLog = function(){
	return cp.exec(ADB+" logcat -v threadtime>"+TMP_FILE);
}

cmd_helper._adbclear = function(){
	return cp.exec(ADB+" logcat -c");
}

cmd_helper._rmFile = function(){
	if(os.type().indexOf('Windows') >= 0){
		return cp.exec("del "+TMP_FILE);
	}
	else {
		return cp.exec("rm "+TMP_FILE);
	}
}

cmd_helper._process = function(){

	if (this._CMDS && this._CMDS.length){

		var cmd = this._CMDS.shift();
		var curr_obj = this;

		if(VERBOSE){
			console.log("Command Execute: "+JSON.stringify(cmd));
			console.log("Remaining cmd:"+this._CMDS.length);
		}

		if(cmd.type.indexOf('adb')>=0){
			this._adb(cmd.value).on('exit', function(){
				setTimeout(function(){curr_obj._process()}, cmd.delay?cmd.delay:0);
			});
		}
		else if(cmd.type.indexOf('cmd')>=0){
			this._cmd(cmd.value).on('exit', function(){
				setTimeout(function(){curr_obj._process()}, cmd.delay?cmd.delay:0);
			});
		}
		else if(cmd.type.indexOf('adb_clear')>=0){
			this._adbclear().on('exit', function(){
				setTimeout(function(){curr_obj._process()}, cmd.delay?cmd.delay:0);
			});
		}
		else if(cmd.type.indexOf('adb_log')>=0){
			this._adbLog().on('exit', function(){
				setTimeout(function(){curr_obj._process()}, cmd.delay?cmd.delay:0);
			});
		}
		else if(cmd.type.indexOf('clear_log')>=0){
			this._rmFile().on('exit', function(){
				setTimeout(function(){curr_obj._process()}, cmd.delay?cmd.delay:0);
			});
		}
		else{
			console.log("Unknow command:"+cmd.type);
			this._process();
		}

	}
	else if(typeof(this._CB) == 'function'){
		this._CB();
		this._CB = undefined;
	}
}

cmd_helper.process = function(cmds, cb){
	this._CB = cb;
	this._CMDS = cmds;

	this._process();
}

module.exports = cmd_helper;