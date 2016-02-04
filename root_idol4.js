var ch = require('./cmd_helper.js');

ch.process([
	{
		"type":"adb",
		"value":"shell am start com.jrdcom.user2root/.JrdUser2Root",  //Launch root activity
		"delay":3000
	},
	{
		"type":"adb",
		"value":"shell input tap  175 332", //Tap root
		"delay":2000
	},
	{
		"type":"adb",
		"value":"shell setenforce 0", //Disable se-linux
		"delay":0
	}
], function(){
	console.log("Run out/host/linux-x86/bin/adb disable-verity && Reboot.");
});
