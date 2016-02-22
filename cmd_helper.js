var os = require('os');
var cp = require('child_process'); 
var fs = require('fs');

var TAG = '[cmd_helper]'

//To config here
var ADB = "adb";
var TMP_FILE = "/tmp/~camLaunchLog.txt";

var ADB_WIN = "adb.exe";
var TMP_FILE_WIN = 'D:/camLaunchLog.txt';

var APK_PKG = 'com.tct.camera';

if(os.type().indexOf('Windows') >= 0){
	ADB = ADB_WIN;
	TMP_FILE = TMP_FILE_WIN;
}

var VERBOSE = true;

var UBUNTU_14_04_TRICK = false;

var cmd_helper = {};

cmd_helper._inProcess = false;

cmd_helper._adb = function(cmd){
	if(VERBOSE){
		console.log(TAG+'Executing: '+ADB+" "+cmd);		
	}
	return cp.exec(ADB+" "+cmd);
}

cmd_helper._adbQuick = function(cmd){
	if(VERBOSE){
		console.log(TAG+'Executing: '+ADB+" "+cmd);		
	}

	var ret;

	cmd.forEach(function(v,i,a){
		ret = cp.exec(ADB+" "+v);
	});

	return ret;
}

cmd_helper._cmd = function(cmd){
	return cp.exec(cmd);
}

cmd_helper._adbLog = function(){
	if(VERBOSE){
		console.log(TAG+'Executing: '+ADB+" logcat -v threadtime>"+TMP_FILE);		
	}
	this._gLogP = cp.exec(ADB+" logcat -v threadtime>"+TMP_FILE);
	return this._gLogP;
}

cmd_helper._adbStopLog = function(){
	if (this._gLogP){
		if (UBUNTU_14_04_TRICK){
			cp.exec('kill '+(this._gLogP.pid+2));
		}
		else {
			this._gLogP.kill('SIGTERM');
		}

		this._gLogP = null;
	}
}

cmd_helper.readLog = function(){
	var content;

	try{
		content = fs.readFileSync(TMP_FILE).toString().split("\r\n");
	}
	catch(e) {
		content = null;
	}
	return content;
}

cmd_helper._adbclear = function(){
	this._adbStopLog();
	try{
		fs.unlinkSync(TMP_FILE);
	}
	catch(e){
	}

	if(VERBOSE){
		console.log(TAG+'Executing: '+ADB+" logcat -c");		
	}
	return cp.exec(ADB+" logcat -c");
}

cmd_helper.inProcess = function(){
	return this._inProcess;
}

cmd_helper._process = function(){

	if (this._CMDS && this._CMDS.length){
		var cmd = this._CMDS.shift();
		var inst = this;

		inst._inProcess = true;

		if(VERBOSE){
			console.log(TAG+"Push cmd: "+JSON.stringify(cmd));
			console.log(TAG+"Remaining cmd:"+this._CMDS.length);
		}


		if(cmd.type.indexOf('cmd')>=0){
			this._cmd(cmd.value).on('exit', function(){
				setTimeout(function(){inst._process()}, cmd.delay?cmd.delay:0);
			});
		}
		else if(cmd.type.indexOf('adb_log_clear')>=0){
			this._adbclear().on('exit', function(){
				setTimeout(function(){inst._process()}, cmd.delay?cmd.delay:0);
			});
		}
		else if(cmd.type.indexOf('adb_log')>=0){
			this._adbLog();
			setTimeout(function(){inst._process()}, cmd.delay?cmd.delay:0);
		}
		else if(cmd.type.indexOf('adb_stop_log')>=0){
			this._adbStopLog();
			setTimeout(function(){inst._process()}, cmd.delay?cmd.delay:0);
		}
		else if(cmd.type.indexOf('adb_batch')>=0){
			this._adbQuick(cmd.value);
			setTimeout(function(){inst._process()}, cmd.delay?cmd.delay:0);
		}
		else if(cmd.type.indexOf('adb')>=0){
			this._adb(cmd.value).on('exit', function(){
				setTimeout(function(){inst._process()}, cmd.delay?cmd.delay:0);
			});
		}
		else{
			if(VERBOSE) {
				console.log(TAG+"Unknow command:"+cmd.type);
			}
			this._process();
		}
	}
	else {
		var cbFunc = this._CB;
		this._CB = undefined;
		this._inProcess = false;

		if(typeof(cbFunc) === 'function'){
			cbFunc();
		}
		
	}
}

cmd_helper.process = function(cmds, cb){

	if(this._CB){
		if (VERBOSE) {
			console.log(TAG+'Some action is in processing!');
			console.log(TAG+'Please resend later:'+cmds.toString());			
		}

		return;
	}

	this._CB = cb;
	this._CMDS = cmds;

	this._process();
}

module.exports = cmd_helper;