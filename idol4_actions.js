var ch = require('./cmd_helper.js');
var fs = require('fs');
var parser = require('./idol4_log_parser.js');

var idol4_actions = {};

var VERBOSE = false;

var TAG = "[idol4_actions]";

var ACT_LAUNCH_ROOT_APK = {
	"type":"adb",
	"value":"shell am start com.jrdcom.user2root/.JrdUser2Root",  //Launch root activity
	"delay":2500
};

var ACT_TAP_ROOT_BUTTON = {
	"type":"adb",
	"value":"shell input tap  175 332", //Tap root
	"delay":1500
};

var ACT_DISABLE_SELINUX = 	{
	"type":"adb",
	"value":" shell setenforce  0", //Disable se-linux
	"delay":100
};

var ACT_READ_BACKLIGT = {
	"type":"adb",
	"value":"shell cat /sys/class/leds/lcd-backlight/brightness > tmp_result.txt", //Disable se-linux
	"delay":100	
};

var ACT_PRESS_POWERKEY = {
	"type":"adb",
	"value":"shell input keyevent 26", //Press power key
	"delay": 3000		
};

var ACT_SWIPE_UP = {
	"type":"adb",
	"value":"shell input swipe 500 800 500 300", //Swipe to unlock
	"delay": 1000	
};

var ACT_LAUNCH_CAMERA_APK = {
	"type":"adb",
	"value":"shell am start com.tct.camera",
	"delay":2800
};

var ACT_GOTO_LAUNCHER = {
	"type":"adb",
	"value":"shell am start com.tct.launcher/.Launcher",
	"delay":2000	
};

var ACT_KILL_CAMERA_APK = {
	"type":"adb",
	"value":"shell am force-stop com.tct.camera",
	"delay":2000	
};


var ACT_CLEAR_LOG = {
	"type":"adb_log_clear",
	"delay":1000
};

var ACT_START_LOG = {
	"type":"adb_log",
	"delay":1000
};

var ACT_STOP_LOG = {
	"type":"adb_stop_log",
	"delay":1000
};

var ACT_SWIPE_LEFT = {
	"type":"adb",
	"value":"shell input swipe 100 300 500 300",
	"delay":2000	
};

var ACT_SWIPE_RIGHT = {
	"type":"adb",
	"value":"shell input swipe 500 300 100 300",
	"delay":2000	
};


var ACT_TOGGLE_FRONT_BACK_FHD = {
	"type":"adb",
	"value":"shell input tap 960 126",
	"delay":2200	
};

var ACT_TOGGLE_FRONT_BACK_2K = {
	"type":"adb",
	"value":"shell input tap 1360 95",
	"delay":2200	
};

var ACT_TOGGLE_FRONT_BACK = ACT_TOGGLE_FRONT_BACK_FHD;

var ACT_TAKE_PICTURE = {
	"type":"adb",
	"value":"shell input keyevent 24",
	"delay":1000	
};

var ACT_BOOM_KEY = {
	"type":"adb_batch",
	"value":["shell input keyevent 276", "shell input keyevent 276"],
	"delay": 2800
};

var ACT_BURST_CAPTURE_FHD = {
	"type":"adb",
	"value":"shell input swipe 540 1625 540 1625 4000",
	"delay":2000		
}

var ACT_BURST_CAPTURE_2K = {
	"type":"adb",
	"value":"shell input swipe 766 2161 766 2161 4000",
	"delay":2000		
}

var ACT_BURST_CAPTURE = ACT_BURST_CAPTURE_FHD;

var ACT_START_VIDEO_RECORD = {
	"type":"adb",
	"value":"shell input tap 946 1650",
	"delay":2000	
}


var SCENARIO_ROOT_IDOL4 = [ACT_LAUNCH_ROOT_APK, ACT_TAP_ROOT_BUTTON, ACT_DISABLE_SELINUX];

//ch.process(SCENARIO_ROOT_IDOL4);

idol4_actions.__queue = [];
idol4_actions.__processing = 0;


idol4_actions.addTask = function(action, param, cb){
	var entry = {
		'act': action,
		'param': param,
		'ret': cb
	};

	this.__queue.push(entry);
	this.next();
}

//Be careful to se insert Task,it is designed to be use internally
idol4_actions.insertTask = function(action, param,cb){
	var entry = {
		'act': action,
		'param': param,
		'ret': cb
	};

	this.__queue.unshift(entry);
	this.next();	
}


idol4_actions.next = function(){
	var inst = this;

	if (inst.__queue.length <= 0){
		return;
	}

	if(ch.inProcess()){
		return;
	}

	var entry = inst.__queue.shift();

	if(VERBOSE){
		console.log(TAG+"Perform next action");
		console.log(TAG+entry.toString());
	}

	switch(entry.act){
		case 'root':
			inst._root();
			break;
		case 'lighton':
			inst._lightOn();
			break;
		case 'pressPowerKey':
			inst._pressPowerKey();
			break;
		case 'lightoff':
			inst._lightOff();
		case 'unlock':
			inst._unlockScreen();
			break;
		case 'test_cold_start':
			inst._testColdStart(entry.param, entry.ret);
			break;
		case 'test_warm_start':
			inst._testWarmStart(entry.param, entry.ret);
			break;
		case 'test_switch_mode':
			inst._testSiwthMode(entry.param, entry.ret);
			break;
		case 'test_switch_camera':
			inst._testSiwthCamera(entry.param, entry.ret);
			break;
		case 'test_capture':
			inst._testCapture(entry.param, entry.ret);
			break;
		case 'test_burst_capture':
			inst._testBurstCapture(entry.ret); //Only test once
			break;			
		case 'test_instant_capture':
			inst._testInstantCapture(entry.param, entry.ret);
			break;
		case "set_2k":
			ACT_BURST_CAPTURE = ACT_BURST_CAPTURE_2K
			ACT_TOGGLE_FRONT_BACK = ACT_TOGGLE_FRONT_BACK_2K;
			inst.next();
			break;
		case "set_fhd":
			ACT_BURST_CAPTURE = ACT_BURST_CAPTURE_FHD;
			ACT_TOGGLE_FRONT_BACK = ACT_TOGGLE_FRONT_BACK_FHD;
			inst.next();
			break;
		default:
			break;
	}
}

idol4_actions._checkBacklight = function(cb){
	var inst = this;

	ch.process([ACT_READ_BACKLIGT], function(){
		var content = fs.readFileSync('tmp_result.txt').toString();
		fs.unlinkSync('tmp_result.txt');

		if(cb && typeof(cb)==='function'){
			cb(parseInt(content));
		}
		else {
			inst.next();
		}
	});	
}	


idol4_actions._root = function(){
	var inst = this;

	ch.process(SCENARIO_ROOT_IDOL4, function(){
		console.log("Run out/host/linux-x86/bin/adb disable-verity && Reboot.");
		inst.next();
	});		
}


idol4_actions._unlockScreen = function(){
	var inst = this;

	ch.process([ACT_SWIPE_UP], function(){
		inst.next();
	});
}
	
idol4_actions._pressPowerKey = function(){
	var inst = this;

	ch.process([ACT_PRESS_POWERKEY], function(){
		inst.next();
	});
}

idol4_actions._lightOn = function(){
	var inst = this;

	inst._checkBacklight(function(result){
		if(result === 0){
			inst.insertTask('pressPowerKey');//Trigger the press power key directly
		}
		else {
			inst.next();
		}
	})
}

idol4_actions._lightOff = function(cb){
	var inst = this;

	inst._checkBacklight(function(result){
		if(result > 0){
			inst._pressPowerKey();
		}
		else {
			inst.next();
		}
	})	
}

idol4_actions._testColdStart = function (time, cb){
	var inst = this;

	var scenario = [ACT_CLEAR_LOG, ACT_START_LOG];

	while(time-- > 0){
		scenario.push(ACT_LAUNCH_CAMERA_APK);
		scenario.push(ACT_KILL_CAMERA_APK);
	}

	scenario.push(ACT_STOP_LOG);

	ch.process(scenario, function(){

		parser.parseLaunchTimeCold(ch.readLog());

		if(cb && typeof(cb) === 'function'){
			cb();			
		}
		inst.next();
	})
}

idol4_actions._testWarmStart = function (time, cb){
	var inst = this;

	var scenario = [ACT_LAUNCH_CAMERA_APK, ACT_GOTO_LAUNCHER, ACT_CLEAR_LOG, ACT_START_LOG];

	while(time-- > 0){
		scenario.push(ACT_LAUNCH_CAMERA_APK);
		scenario.push(ACT_GOTO_LAUNCHER);
	}

	scenario.push(ACT_STOP_LOG);

	ch.process(scenario, function(){

		parser.parseLaunchTimeWarm(ch.readLog());

		if(cb && typeof(cb) === 'function'){
			cb();			
		}
		inst.next();
	})
}

idol4_actions._testSiwthMode = function (time, cb){
	var inst = this;

	var scenario = [ACT_CLEAR_LOG, ACT_START_LOG, ACT_LAUNCH_CAMERA_APK];

	while(time-- > 0){
		scenario.push(ACT_SWIPE_RIGHT);
		scenario.push(ACT_SWIPE_LEFT);
	}

	scenario.push(ACT_GOTO_LAUNCHER)
	scenario.push(ACT_STOP_LOG);

	ch.process(scenario, function(){

		parser.parseSwitchMode(ch.readLog());

		if(cb && typeof(cb) === 'function'){
			cb();			
		}
		inst.next();
	})
}


idol4_actions._testSiwthCamera = function (time, cb){
	var inst = this;

	var scenario = [ACT_CLEAR_LOG, ACT_START_LOG, ACT_LAUNCH_CAMERA_APK];

	while(time-- > 0){
		scenario.push(ACT_SWIPE_RIGHT);
		scenario.push(ACT_SWIPE_LEFT);
	}

	scenario.push(ACT_GOTO_LAUNCHER)
	scenario.push(ACT_STOP_LOG);

	ch.process(scenario, function(){

		parser.parseSwitchMode(ch.readLog());

		if(cb && typeof(cb) === 'function'){
			cb();			
		}
		inst.next();
	})
}

idol4_actions._testSiwthCamera = function (time, cb){
	var inst = this;

	var scenario = [ACT_CLEAR_LOG, ACT_START_LOG, ACT_LAUNCH_CAMERA_APK];

	while(time-- > 0){
		scenario.push(ACT_TOGGLE_FRONT_BACK);
		scenario.push(ACT_TOGGLE_FRONT_BACK);
	}

	scenario.push(ACT_GOTO_LAUNCHER)
	scenario.push(ACT_STOP_LOG);

	ch.process(scenario, function(){

		parser.parseSwitchCamera(ch.readLog());

		if(cb && typeof(cb) === 'function'){
			cb();			
		}
		inst.next();
	})
}

idol4_actions._testCapture = function (time, cb){
	var inst = this;

	var scenario = [ACT_CLEAR_LOG, ACT_START_LOG, ACT_LAUNCH_CAMERA_APK];

	while(time-- > 0){
		scenario.push(ACT_TAKE_PICTURE);
	}

	scenario.push(ACT_GOTO_LAUNCHER)
	scenario.push(ACT_STOP_LOG);

	ch.process(scenario, function(){

		parser.parseTakePicture(ch.readLog());

		if(cb && typeof(cb) === 'function'){
			cb();			
		}
		inst.next();
	})
}

idol4_actions._testInstantCapture = function (time, cb){
	var inst = this;

	var scenario = [ACT_LAUNCH_CAMERA_APK, ACT_CLEAR_LOG, ACT_START_LOG];

	while(time-- > 0){
		scenario.push(ACT_PRESS_POWERKEY)
		scenario.push(ACT_BOOM_KEY);
	}
	scenario.push(ACT_STOP_LOG);

	ch.process(scenario, function(){

		parser.parseInstantCapture(ch.readLog());

		if(cb && typeof(cb) === 'function'){
			cb();			
		}
		inst.next();
	})
}

idol4_actions._testBurstCapture = function (cb){
	var inst = this;

	var scenario = [ACT_CLEAR_LOG, ACT_START_LOG, ACT_LAUNCH_CAMERA_APK];

	scenario.push(ACT_BURST_CAPTURE)

	scenario.push(ACT_STOP_LOG);

	ch.process(scenario, function(){

		parser.parseBurstCapture(ch.readLog());

		if(cb && typeof(cb) === 'function'){
			cb();			
		}
		inst.next();
	})
}

module.exports = idol4_actions;