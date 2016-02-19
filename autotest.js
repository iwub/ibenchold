var ch = require('./cmd_helper.js');
var fs = require('fs');


var ACT_LAUNCH_ROOT_APK = {
	"type":"adb",
	"value":"shell am start com.jrdcom.user2root/.JrdUser2Root",  //Launch root activity
	"delay":2500
};

var ACT_TAP_ROOT_BUTTON = {
	"type":"adb",
	"value":"shell input tap  175 332", //Tap root
	"delay":500
};

var ACT_DISABLE_SELINUX = 	{
	"type":"adb",
	"value":"shell setenforce 0", //Disable se-linux
	"delay":0
};

var ACT_READ_BACKLIGT = {
	"type":"adb",
	"value":"shell cat /sys/class/leds/lcd-backlight/brightness > tmp_result.txt", //Disable se-linux
	"delay":0	
};

var SCENARIO_ROOT_IDOL4 = [ACT_LAUNCH_ROOT_APK, ACT_TAP_ROOT_BUTTON, ACT_DISABLE_SELINUX];

//ch.process(SCENARIO_ROOT_IDOL4);


function check_backlight(cb){
	ch.process([ACT_READ_BACKLIGT], function(){
		var content = fs.readFileSync('tmp_result.txt').toString();
		fs.unlinkSync('tmp_result.txt');
		cb(parseInt(content));
	});	
}	

check_backlight(function(d){console.log(d)});