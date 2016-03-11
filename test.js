var actions = require('./idol4_actions.js');
var parser = require('./idol4_log_parser.js');

actions.addTask('set_fhd');

actions.addTask('lighton');
actions.addTask('unlock');

actions.addTask('test_cold_start', 10);
actions.addTask('test_warm_start', 10);
actions.addTask('test_switch_mode', 10);
actions.addTask('test_switch_camera', 10);
actions.addTask('test_capture',10);
actions.addTask('test_burst_capture');

actions.addTask('test_instant_capture', 10);
