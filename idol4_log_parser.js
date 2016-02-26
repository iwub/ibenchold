
var idol4_log_parser = {};

var VERBOSE = false;

var CAMERA_OPEN_START_TOKEN = 'E PROFILE_OPEN_CAMERA';
var CAEMRA_OPEN_END_TOKEN = 'PROFILE_FIRST_PREVIEW_FRAME';

var CAMERA_TAKE_PICTURE_START_TOKEN = 'PROFILE_TAKE_PICTURE';
var CAMERA_TAKE_PICTURE_END_TOKEN = 'PROFILE_JPEG_CB';


var CAMERA_PREVIEW_STOP_TOKEN = 'PROFILE_STOP_PREVIEW';

var CAMERA_INSTANT_CAPTURE_START_TOKEN = "instant capture kpi, Try start instantCaptureHelper";
var CAMERA_INSTANT_CAPTURE_END_TOKEN = "instant capture kpi, onPictureTaken";



idol4_log_parser._parse = function(content, token1, token2, print_label){

	if (VERBOSE){
		console.log("Start log parsing...");
	}

	var start_log = [];
	var end_log = [];

	if (VERBOSE){
		console.log("Total line of log: "+content.length);
	}

	content.forEach(function(v,i,a){
		if(v.indexOf(token1) > 0){
			var time = v.match(/ (\d{2}):(\d{2}):(\d{2}).(\d{3}) /);
			var curr_time = parseInt(time[1])*60*60*1000+parseInt(time[2])*60*1000+parseInt(time[3])*1000+parseInt(time[4]);
			//console.log(time);
			if(VERBOSE){
				console.log("Find start log at line "+i);
			}
			start_log.push(curr_time);
		}	
		else if(token2 && v.indexOf(token2) > 0){
			var time = v.match(/ (\d{2}):(\d{2}):(\d{2}).(\d{3}) /);
			var curr_time = parseInt(time[1])*60*60*1000+parseInt(time[2])*60*1000+parseInt(time[3])*1000+parseInt(time[4]);
			//console.log(time);
			if(VERBOSE){
				console.log("Find end log at line "+i);
			}
			end_log.push(curr_time);
		}
	});

	var r_start_log = [];
	var r_end_log = [];
	var on_start = true;

	while(end_log.length>0){
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

	console.log("\r\n"+print_label);
	var total = 0;

	if(token2) {
		r_end_log.forEach(function(v,i,a){
			console.log((r_end_log[i] - r_start_log[i]) + ' ms');
			total += r_end_log[i] - r_start_log[i];
		});

		console.log('Average: '+Math.round(total/r_end_log.length)+" ms");
	}
	else {
		start_log.forEach(function(v,i,a){
			if(0 == i){
				return;
			}
			else {
				console.log(start_log[i] - start_log[i-1] + ' ms');
				total += start_log[i] - start_log[i-1];
			}
		});

		console.log('Average: '+Math.round(total/(start_log.length-1))+" ms");
	}
}

idol4_log_parser.parseLaunchTimeCold = function(content){
	this._parse(content, CAMERA_OPEN_START_TOKEN, CAEMRA_OPEN_END_TOKEN, "--Time For Camera Launch(Cold)--");
}

idol4_log_parser.parseLaunchTimeWarm = function(content){
	this._parse(content, CAMERA_OPEN_START_TOKEN, CAEMRA_OPEN_END_TOKEN, "--Time For Camera Launch(Warm)--");
}

idol4_log_parser.parseSwitchMode = function(content){
	this._parse(content, CAMERA_PREVIEW_STOP_TOKEN, CAEMRA_OPEN_END_TOKEN, "--Time For Switch Mode--");
}

idol4_log_parser.parseSwitchCamera = function(content){
	this._parse(content, CAMERA_PREVIEW_STOP_TOKEN, CAEMRA_OPEN_END_TOKEN, "--Time For Toggle Camera--");
}

idol4_log_parser.parseTakePicture = function(content){
	this._parse(content, CAMERA_TAKE_PICTURE_START_TOKEN, CAMERA_TAKE_PICTURE_END_TOKEN, "--Time For Take Picture--");
}

idol4_log_parser.parseBurstCapture = function(content){
	this._parse(content, CAMERA_TAKE_PICTURE_START_TOKEN, null, "--Time-lapse between Burst Capture--");
}

idol4_log_parser.parseInstantCapture = function(content){
	this._parse(content, CAMERA_INSTANT_CAPTURE_START_TOKEN, CAMERA_INSTANT_CAPTURE_END_TOKEN, "--Time For Instant Capture--");
}

module.exports = idol4_log_parser;
