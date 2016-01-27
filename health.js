var os = require('os');
var cp = require('child_process'); 
var process = require('process');
var fs = require('fs');

var ADB = "/automount/suntools/Ubuntu/adb";
var TMP_FILE = "/tmp/~camLaunchLog.txt";
var cmdClearLog = "rm -rf "+TMP_FILE;

var ADB_WIN = "adb.exe";
var TMP_FILE_WIN = 'D:/camLaunchLog.txt';
var cmdClearLog_WIN = "del "+TMP_FILE;

if(os.type().indexOf('Windows') >= 0){
	ADB = ADB_WIN;
	TMP_FILE = TMP_FILE_WIN;
	cmdClearLog = cmdClearLog_WIN;
}

function check_property(label, property,cb){
	var cmd = ADB+" shell getprop "+property+">"+TMP_FILE;
	cp.exec(cmd).on('exit',function(){
		var content = fs.readFileSync(TMP_FILE).toString().trim();
		cb(label, content);
	})
}

function check_product(cb){
	check_property("Product", "def.tctfw.brandMode.name", cb);
}

function check_baseline(cb){
	check_property("Baseline", "gsm.version.baseband", cb);
}


function check_hw(cb){
	check_property("Hardware", "ro.def.hardware.version", cb);
}

function check_sw(cb){
	check_property("Software", "ro.tct.sys.ver", cb);
}

function check_perf(cb){
	check_property("KernelBuild", "ro.tct.kernelconfig", cb);
}


var CHECK_LIST_MAIN = [
	check_product,
	check_baseline,
	check_hw,
	check_sw,
	check_perf
];




function checkcb(key, value){
	console.log("["+key+"]"+"    "+value);
	if(CHECK_LIST_MAIN.length>0){
		(CHECK_LIST_MAIN.shift())(checkcb);
	}
}

(function main(){
	console.log("-----Main-----");
	if(CHECK_LIST_MAIN.length>0){
		(CHECK_LIST_MAIN.shift())(checkcb);
	}	
})();