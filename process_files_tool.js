var os = require('os');
var cp = require('child_process'); 
var fs = require('fs');

var VERBOSE = false;

function process_all_files(dir, dirCB, fileCB){
	var folder = fs.readdirSync(dir);

	for (var i=0; i<folder.length; i++){
		if (fs.lstatSync(dir+folder[i]).isFile()){
			if (fileCB){
				if (Array.isArray(fileCB)){
					for(var ii=0; ii<fileCB.length; ii++){
						fileCB[ii](dir+folder[i]);
					}
				}
				else if (typeof(fileCB) === "function"){
					fileCB(dir+folder[i]);
				}
			}
		}
		else if(fs.lstatSync(dir+folder[i]).isDirectory()){
			if (dirCB){
				if (Array.isArray(dirCB)){
					for(var ii=0; ii<dirCB.length; ii++){
						dirCB[ii](dir+folder[i]+'/');
					}
				}
				else if (typeof(dirCB) === "function"){
					dirCB(dir+folder[i]+'/');
				}
			}
			process_all_files(dir+folder[i]+'/', dirCB, fileCB);
		}
	}
} 

function extract_property(filePath){
	var content = fs.readFileSync(filePath).toString();
	
	content.split("\n").forEach(function(v,i,a){
		var result = v.match(/property_get\s*\(\"(\S+)\"/);
		if(result){
			if(ALL_PROPERTIES.indexOf(result[1]) == -1){
				ALL_PROPERTIES.push(result[1]);
			}
		}
	})
}

var ALL_PROPERTIES = [];


var PROJECT = "/local/project/idol4_dbg";

var ALL_PATHS = [
	'hardware/qcom/camera/QCamera2/',
	'vendor/qcom/proprietary/mm-camera/',
	'vendor/qcom/proprietary/mm-still/'
];

(function main(){
	ALL_PATHS.forEach(function(v,i,a){

		process_all_files(PROJECT+'/'+v, [
			function(path){
				if(VERBOSE)
					console.log("Process Dir:"+path);
			}
			], [extract_property])
	});
	
	ALL_PROPERTIES.sort();
	console.log(ALL_PROPERTIES);
})();