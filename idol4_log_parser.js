
var idol4_log_parser = {};

var VERBOSE = false;


var UNKNOWN_TOKEN = '--TO BE CONFIRMED--';

/*Common*/
var CAMERA_OPEN_TOKEN_HAL_QCOM = 'E PROFILE_OPEN_CAMERA';
var CAMERA_PREVIEW_STOP_TOKEN_HAL_QCOM = 'PROFILE_STOP_PREVIEW';
var CAMERA_PREVIEW_FIRST_FRAME_HAL_QCOM = 'PROFILE_FIRST_PREVIEW_FRAME';
var CAMERA_TAKE_PICTURE_TOKEN_HAL_QCOM = 'PROFILE_TAKE_PICTURE';
var CAMERA_TAKE_PICTURE_DONE_HAL_QCOM = 'stop data proc';

var CAMERA_OPEN_TOKEN_HAL_MTK = UNKNOWN_TOKEN;
var CAMERA_PREVIEW_STOP_TOKEN_HAL_MTK = UNKNOWN_TOKEN;
var CAMERA_PREVIEW_FIRST_FRAME_HAL_MTK = UNKNOWN_TOKEN;
var CAMERA_TAKE_PICTURE_TOKEN_HAL_MTK = UNKNOWN_TOKEN;
var CAMERA_TAKE_PICTURE_DONE_HAL_MTK = UNKNOWN_TOKEN;

/*Camera Launch*/
var CAMERA_OPEN_COLD_START_TOKEN = "onCreate CameraApplication";
var CAMERA_OPEN_WARM_START_TOKEN = "Build info";

var CAMERA_OPEN_END_TOKEN = CAMERA_PREVIEW_FIRST_FRAME_HAL_QCOM;//"KPI on surfaceTexture updated";

var CAMERA_OPEN_START_TOKEN_HAL = CAMERA_OPEN_TOKEN_HAL_QCOM;
var CAMERA_OPEN_END_TOKEN_HAL = CAMERA_PREVIEW_FIRST_FRAME_HAL_QCOM;

/*Mode switch*/
var CAMERA_MODE_SWITCH_START_TOKEN = 'KPI start mode selecting';
var CAMERA_MODE_SWITCH_END_TOKEN = 'call hideImageCover';

var CAMERA_MODE_SWITCH_START_TOKEN_HAL = CAMERA_PREVIEW_STOP_TOKEN_HAL_QCOM;
var CAMERA_MODE_SWITCH_END_TOKEN_HAL = CAMERA_PREVIEW_FIRST_FRAME_HAL_QCOM;

/*Camera Switch*/
var CAMERA_TOGGLE_START_TOKEN = "Start to switch camera. id";
var CAMERA_TOGGLE_END_TOKEN = "call hideImageCover";

var CAMERA_TOGGLE_START_TOKEN_HAL =CAMERA_PREVIEW_STOP_TOKEN_HAL_QCOM;
var CAMERA_TOGGLE_END_TOKEN_HAL = CAMERA_PREVIEW_FIRST_FRAME_HAL_QCOM;

/*Take Picture*/
var CAMERA_TAKE_PICTURE_START_TOKEN = 'KPI shutter click';
var CAMERA_TAKE_PICTURE_END_TOKEN = 'show preCapture animation';

var CAMERA_TAKE_PICTURE_START_TOKEN_HAL = CAMERA_TAKE_PICTURE_TOKEN_HAL_QCOM;
var CAMERA_TAKE_PICTURE_END_TOKEN_HAL = CAMERA_TAKE_PICTURE_DONE_HAL_QCOM;


/*Burst*/
var CAMREA_BURST_TOKEN = 'OnPictureTaken in burst';

var CAMERA_BURST_TOKEN_HAL = CAMERA_TAKE_PICTURE_TOKEN_HAL_QCOM;

/*Video*/
var CAMERA_CAPTURE_VIDEO_START_TOKEN = "click video shutter";
var CAMERA_CAPTURE_VIDEO_END_TOKEN = "show recording UI;";

var CAMERA_CAPTURE_VIDEO_START_TOKEN_HAL = CAMERA_PREVIEW_STOP_TOKEN_HAL_QCOM;
var CAMERA_CAPTURE_VIDEO_END_TOKEN_HAL = CAMERA_PREVIEW_FIRST_FRAME_HAL_QCOM;

/*Instant Capture*/
var CAMERA_INSTANT_CAPTURE_START_TOKEN = "instant capture kpi,second boom key down";
var CAMERA_INSTANT_CAPTURE_END_TOKEN = "instant capture kpi, onPictureTaken";

var CAMERA_INSTANT_CAPTURE_UI_END_TOKEN = "instant capture kpi, bitmap display";

var CAMERA_INSTANT_CAPTURE_START_TOKEN_HAL = CAMERA_OPEN_TOKEN_HAL_QCOM;
var CAMERA_INSTANT_CAPTURE_END_TOKEN_HAL = CAMERA_TAKE_PICTURE_DONE_HAL_QCOM;


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
			else{
				break;
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

idol4_log_parser.set_platform = function(plat) {
	if (plat.indexOf('mtk') >= 0){
 		CAMERA_OPEN_START_TOKEN_HAL = CAMERA_OPEN_TOKEN_HAL_MTK;
 		CAMERA_OPEN_END_TOKEN_HAL = CAMERA_PREVIEW_FIRST_FRAME_HAL_MTK;

		CAMERA_MODE_SWITCH_START_TOKEN_HAL = CAMERA_PREVIEW_STOP_TOKEN_HAL_MTK;
		CAMERA_MODE_SWITCH_END_TOKEN_HAL = CAMERA_PREVIEW_FIRST_FRAME_HAL_MTK;

		CAMERA_TOGGLE_START_TOKEN_HAL =CAMERA_PREVIEW_STOP_TOKEN_HAL_MTK;
		CAMERA_TOGGLE_END_TOKEN_HAL = CAMERA_OPEN_END_TOKEN_HAL_MTK;

		CAMERA_TAKE_PICTURE_START_TOKEN_HAL = CAMERA_TAKE_PICTURE_TOKEN_HAL_MTK;
		CAMERA_TAKE_PICTURE_END_TOKEN_HAL = CAMERA_TAKE_PICTURE_DONE_HAL_MTK;

		CAMERA_BURST_TOKEN_HAL = CAMERA_TAKE_PICTURE_DONE_HAL_MTK;

		CAMERA_INSTANT_CAPTURE_START_TOKEN_HAL = CAMERA_OPEN_TOKEN_HAL_MTK;
		CAMERA_INSTANT_CAPTURE_END_TOKEN_HAL = CAMERA_TAKE_PICTURE_DONE_HAL_MTK;

	}
	else {
 		CAMERA_OPEN_START_TOKEN_HAL = CAMERA_OPEN_TOKEN_HAL_QCOM;
 		CAMERA_OPEN_END_TOKEN_HAL = CAMERA_PREVIEW_FIRST_FRAME_HAL_QCOM;

 		CAMERA_OPEN_END_TOKEN = CAMERA_OPEN_END_TOKEN_HAL; //engineer just told he cannot differenticate the first frame and remains...

		CAMERA_MODE_SWITCH_START_TOKEN_HAL = CAMERA_PREVIEW_STOP_TOKEN_HAL_QCOM;
		CAMERA_MODE_SWITCH_END_TOKEN_HAL = CAMERA_PREVIEW_FIRST_FRAME_HAL_QCOM;

		CAMERA_TOGGLE_START_TOKEN_HAL =CAMERA_PREVIEW_STOP_TOKEN_HAL_QCOM;
		CAMERA_TOGGLE_END_TOKEN_HAL = CAMERA_OPEN_END_TOKEN_HAL_QCOM;

		CAMERA_TAKE_PICTURE_START_TOKEN_HAL = CAMERA_TAKE_PICTURE_TOKEN_HAL_QCOM;
		CAMERA_TAKE_PICTURE_END_TOKEN_HAL = CAMERA_TAKE_PICTURE_DONE_HAL_QCOM;

		CAMERA_BURST_TOKEN_HAL = CAMERA_TAKE_PICTURE_DONE_HAL_QCOM;

		CAMERA_INSTANT_CAPTURE_START_TOKEN_HAL = CAMERA_OPEN_TOKEN_HAL_QCOM;
		CAMERA_INSTANT_CAPTURE_END_TOKEN_HAL = CAMERA_TAKE_PICTURE_DONE_HAL_QCOM;
	}
}

idol4_log_parser.parseLaunchTimeCold = function(content){
	this._parse(content, CAMERA_OPEN_COLD_START_TOKEN, CAMERA_OPEN_END_TOKEN, "--Time For Camera Launch(Cold)--");
	this._parse(content, CAMERA_OPEN_START_TOKEN_HAL, CAMERA_OPEN_END_TOKEN_HAL, "--Time For Camera Launch(Cold)-(HAL)--");
}

idol4_log_parser.parseLaunchTimeWarm = function(content){
	this._parse(content, CAMERA_OPEN_WARM_START_TOKEN, CAMERA_OPEN_END_TOKEN, "--Time For Camera Launch(Warm)--");
	this._parse(content, CAMERA_OPEN_START_TOKEN_HAL, CAMERA_OPEN_END_TOKEN_HAL, "--Time For Camera Launch(Warm)-(HAL)--");
}

idol4_log_parser.parseSwitchMode = function(content){
	this._parse(content, CAMERA_MODE_SWITCH_START_TOKEN, CAMERA_MODE_SWITCH_END_TOKEN, "--Time For Switch Mode--");
	this._parse(content, CAMERA_MODE_SWITCH_START_TOKEN_HAL, CAMERA_MODE_SWITCH_END_TOKEN_HAL, "--Time For Switch Mode-(HAL)--");
}

idol4_log_parser.parseSwitchCamera = function(content){
	this._parse(content, CAMERA_TOGGLE_START_TOKEN, CAMERA_TOGGLE_END_TOKEN, "--Time For Toggle Camera--");
	this._parse(content, CAMERA_TOGGLE_START_TOKEN_HAL, CAMERA_TOGGLE_END_TOKEN_HAL, "--Time For Toggle Camera-(HAL)--");
}

idol4_log_parser.parseTakePicture = function(content){
	this._parse(content, CAMERA_TAKE_PICTURE_START_TOKEN, CAMERA_TAKE_PICTURE_END_TOKEN, "--Time For Take Picture--");
	this._parse(content, CAMERA_TAKE_PICTURE_START_TOKEN_HAL, CAMERA_TAKE_PICTURE_END_TOKEN_HAL, "--Time For Take Picture-(HAL)--");
}

idol4_log_parser.parseBurstCapture = function(content){
	this._parse(content, CAMREA_BURST_TOKEN, null, "--Time-lapse between Burst Capture--");
	this._parse(content, CAMERA_BURST_TOKEN_HAL, null, "--Time-lapse between Burst Capture-(HAL)--");
}

idol4_log_parser.parseVideoStart = function(content){
	this._parse(content, CAMERA_CAPTURE_VIDEO_START_TOKEN, CAMERA_CAPTURE_VIDEO_END_TOKEN, "--Time For Starting Video--");
	this._parse(content, CAMERA_CAPTURE_VIDEO_START_TOKEN_HAL, CAMERA_CAPTURE_VIDEO_END_TOKEN_HAL, "--Time For Starting Video-(HAL)--");
}

idol4_log_parser.parseInstantCapture = function(content){
	this._parse(content, CAMERA_INSTANT_CAPTURE_START_TOKEN, CAMERA_INSTANT_CAPTURE_END_TOKEN, "--Time For Instant Capture--");
	this._parse(content, CAMERA_INSTANT_CAPTURE_START_TOKEN, CAMERA_INSTANT_CAPTURE_UI_END_TOKEN, "--Time For Instant Capture-(UI)--");	
	this._parse(content, CAMERA_INSTANT_CAPTURE_START_TOKEN_HAL, CAMERA_INSTANT_CAPTURE_END_TOKEN_HAL, "--Time For Instant Capture-(HAL)--");
}

module.exports = idol4_log_parser;
