var idol4_perf = require('./idol4_perf.js');
var idol4_action = require('./idol4_actions.js');


(function main(cmd){
	if(cmd === undefined){
		console.log('--Usage--');
		console.log('node perf.js [cold_start|warm_start|capture|toggle|switch|boom_capture]');			
	}
	else if(cmd.indexOf('cold_start') >= 0){
			idol4_perf.profile_launch_speed(true);
	}
	else if(cmd.indexOf('warm_start') >= 0){
			idol4_perf.profile_launch_speed(false);
	}
	else if(cmd.indexOf('boom_capture') >= 0){
			idol4_perf.profile_boom_capture();
	}
	else if(cmd.indexOf('capture') >= 0){
			idol4_perf.profile_take_picture();
	}
	else if(cmd.indexOf('toggle') >= 0){
			idol4_perf.profile_toggle();

	}
	else if(cmd.indexOf('switch') >= 0){
			idol4_perf.profile_mode();
	}
	else{
		console.log('--Usage--');
		console.log('node perf.js [cold_start|warm_start|capture|toggle|switch|boom_capture]');			
	}
})(process.argv[2]);
