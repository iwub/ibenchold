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

var VERBOSE = false;

var LAUNCH_COUNT = 3;
var TOGGLE_COUNT = 3;
var TAKE_PICTURE_COUNT = 5;
var SWITCH_MODE_COUNT = 5;

var CAMERA_OPEN_START_TOKEN = 'E PROFILE_OPEN_CAMERA';
var CAEMRA_OPEN_END_TOKEN = 'PROFILE_FIRST_PREVIEW_FRAME';

var CAMERA_TAKE_PICTURE_START_TOKEN = 'PROFILE_TAKE_PICTURE';
var CAMERA_TAKE_PICTURE_END_TOKEN = 'PROFILE_JPEG_CB';


var CAMERA_PREVIEW_STOP_TOKEN = 'PROFILE_STOP_PREVIEW'


var cmdLaunchCamera = ADB+" shell am start com.tct.camera";
var cmdExitCameraSoft = ADB+" shell am start com.tct.launcher/.Launcher";
var cmdExitCameraHard = ADB+" shell am force-stop com.tct.camera";
var cmdStartLog = ADB+" logcat -v threadtime >"+TMP_FILE;

var cmdClearLogcat = ADB+" logcat -c";

var cmdTakePicture = ADB+" shell input keyevent 24";
var cmdToggle = ADB+" shell input tap 935 135";
var cmdSwipeRight = ADB+" shell input swipe 500 100 0 100";
var cmdSwipeLeft = ADB+" shell input swipe 0 100 500 100";

var gLogP;

function perform_iteration(cmd1, cmd2, lat1, lat2, count, cb){
	cp.exec(cmd1);

	setTimeout(function(){
		if (cmd2 && cmd2.length > 0){
			cp.exec(cmd2);
		}

		count--;
		if (count>0){
			setTimeout(function(){perform_iteration(cmd1, cmd2, lat1, lat2, count, cb);}, lat1);
		}
		else{
			setTimeout(function(){
				cb(TMP_FILE);
				var child = cp.exec(cmdExitCameraHard);
				child.on('exit', function(){process.exit()});				
			},2000);
		}

	}, lat2);
}


function perform_launch_iteration(hard){
	perform_iteration(
		cmdLaunchCamera, 
		hard?cmdExitCameraHard:cmdExitCameraSoft, 
		3000,
		2000,
		LAUNCH_COUNT, 
		parse_launch_time);
}

function perform_take_picture(){
	perform_iteration(
		cmdTakePicture,
		null,
		2000,
		0,
		TAKE_PICTURE_COUNT,
		parse_take_picture);
}

function perform_toggle_back_front(){
	perform_iteration(
		cmdToggle,
		cmdToggle,
		4000,
		4000,
		TOGGLE_COUNT,
		parse_toggle);
}

function perform_mode_switch(){
	perform_iteration(
		cmdSwipeRight,
		cmdSwipeLeft,
		5000,
		5000,
		SWITCH_MODE_COUNT,
		parse_mode);
}

function parse_log(path, token1, token2, label){
	var content = fs.readFileSync(path);
	var lines = content.toString().split("\r\n");
	var start_log = [];
	var end_log = [];

	end_test();

	lines.forEach(function(v,i,a){
		if(v.indexOf(token1) > 0){
			var time = v.match(/ (\d{2}):(\d{2}):(\d{2}).(\d{3}) /);
			var curr_time = parseInt(time[1])*60*60*1000+parseInt(time[2])*60*1000+parseInt(time[3])*1000+parseInt(time[4]);
			//console.log(time);
			start_log.push(curr_time);
		}	
		else if(v.indexOf(token2) > 0){
			var time = v.match(/ (\d{2}):(\d{2}):(\d{2}).(\d{3}) /);
			var curr_time = parseInt(time[1])*60*60*1000+parseInt(time[2])*60*1000+parseInt(time[3])*1000+parseInt(time[4]);
			//console.log(time);
			end_log.push(curr_time);
		}
	});

	var r_start_log = [];
	var r_end_log = [];
	var on_start = true;

	while(start_log.length>0 || end_log.length>0){
		if(on_start){
			//trim end
			while(start_log[0]>end_log[0] && end_log.length>0){
				end_log.shift();
			}

			//trim start
			while(start_log.length>2 && start_log[1] < end_log[0]){
				start_log.shift()
			}

			if(start_log.length>0){
				r_start_log.push(start_log.shift());
				on_start = false;
			}
		}
		else{
			//trim start
			while(start_log[0]<end_log[0] && start_log.length>0){
				start_log.shift();
			}

			//trim end
			while(end_log.length>2 && end_log[1] < start_log[0]){
				end_log.shift()
			}

			if(end_log.length>0){
				r_end_log.push(end_log.shift());
				on_start = true;
			}			
		}
	}

	if (VERBOSE){
		console.log(r_start_log);
		console.log(r_end_log);
	}

	console.log(label);
	var total = 0;
	r_end_log.forEach(function(v,i,a){
		console.log((r_end_log[i] - r_start_log[i]) + ' ms');
		total += r_end_log[i] - r_start_log[i];
	});

	console.log('Average: '+Math.round(total/r_end_log.length)+" ms")
}

function parse_launch_time(path){
	parse_log(
		path, 
		CAMERA_OPEN_START_TOKEN, 
		CAEMRA_OPEN_END_TOKEN, 
		"--Time For Camera Launch--");
}

function parse_take_picture(path){
	parse_log(
		path,
		CAMERA_TAKE_PICTURE_START_TOKEN,
		CAMERA_TAKE_PICTURE_END_TOKEN,
		"--Time For Take Picture--");	
}

function parse_toggle(path){
	parse_log(
		path,
		CAMERA_PREVIEW_STOP_TOKEN,
		CAEMRA_OPEN_END_TOKEN,
		"--Time For Toggle Camera--");
}

function parse_mode(path){
	parse_log(
		path,
		CAMERA_PREVIEW_STOP_TOKEN,
		CAEMRA_OPEN_END_TOKEN,
		"--Time For Switch Mode--");
}

function start_test(callback){
	cp.exec(cmdClearLog).on('exit', function(){ //Clear log
		cp.exec(cmdClearLogcat).on('exit', function(){ //Clear logcat
			gLogP = cp.exec(cmdStartLog);
			callback();
		});
	})		
}

function end_test(){
	gLogP.kill('SIGTERM');
}

function profile_launch_speed(hard){
	start_test(function(){
		perform_launch_iteration(hard);
	});
};

function profile_take_picture(){
	start_test(function(){
		cp.exec(cmdLaunchCamera);
		setTimeout(perform_take_picture, 3000);
	});
}

function profile_toggle(){
	start_test(function(){
		cp.exec(cmdLaunchCamera);
		setTimeout(perform_toggle_back_front, 3000);
	});	
}

function profile_mode(){
	start_test(function(){
		cp.exec(cmdLaunchCamera);
		setTimeout(perform_mode_switch, 3000);
	});	
}

(function main(cmd){


	if(cmd.indexOf('cold_start') >= 0){
		profile_launch_speed(true);
	}
	else if(cmd.indexOf('warm_start') >= 0){
		profile_launch_speed(false);
	}
	else if(cmd.indexOf('capture') >= 0){
		profile_take_picture();
	}
	else if(cmd.indexOf('toggle') >= 0){
		profile_toggle();
	}
	else if(cmd.indexOf('switch') >= 0){
		profile_mode();
	}
	else{
		console.log('--Usage--');
		console.log('node perf.js [cold_start|warm_start|capture|toggle|switch]');			
	}
})(process.argv[2]);
