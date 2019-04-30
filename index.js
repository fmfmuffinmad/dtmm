var nodemon = require('nodemon');
var chokidar = require('chokidar');
const execSync = require('child_process').execSync;
const chalk = require('chalk');
const fs = require('fs');

const LOG_MESSAGE = 'MSG';
const LOG_SUCCESS = 'SCC';
const LOG_WARNING = 'WRN';
const LOG_ERROR = 'ERR';
const SFDX_CONFIG_PATH = './sfdx-project.json';
const DTMM_CONFIG_PATH = './dtmm-config.json';
const DTMM_DATA_PATH = './dtmm-data.json';
const DTMM_LOCAL_DATA_PATH = './dtmm-local-data.json';

var startData = {
	features: []
};

var startLocalData = {
	watch: [],
	currentFeature: {
		name: 'default',
		files: [],
		lastDeploy: ''
	}
};

const log = (type = LOG_MESSAGE, category = '', message = 'foo') => {
	let tag;
	switch (type) {
		case LOG_MESSAGE:
			tag = chalk.white(`${type}`);
			break;
		case LOG_SUCCESS:
			tag = chalk.green(`${type}`);
			break;
		case LOG_WARNING:
			tag = chalk.yellow(`${type}`);
			break;
		case LOG_ERROR:
			tag = chalk.red(`${type}`);
			break;
	}
	console.log(`dtmm ${tag} ${chalk.magenta(category)} ${message}`);
}

// Things starts here

// execSync(`sfdx force:source:deploy --sourcepath ${path} --loglevel fatal`, { encoding: 'utf-8' })



fs.readFile(SFDX_CONFIG_PATH, {encoding: 'utf8', flag: 'r+'}, (err, sfdx) => {
	if (err) {
		if ( err.code = 'ENOENT') {
			log(LOG_ERROR, 'config', 'No sfdx-project.json found! Please create a SFDX project... and authorize, jackass...');
			process.exit();
		}
	}

	// Check if user has authorized orgs configured on their SFDX files
	let SFDX_orgs = JSON.parse(execSync(`sfdx force:org:list --json`, { encoding: 'utf-8' }));
	if (SFDX_orgs.status !== 0) {
		log(LOG_ERROR, 'sfdx', SFDX_orgs.message);
		log(LOG_WARNING, 'dtmm', 'Requesting auth... Stand by for incoming BROWSER HACKS... just kiddin, we need you to authorize a org... ');
		execSync(`sfdx force:auth:web:login --setalias default-dev --instanceurl https://test.salesforce.com --setdefaultusername`, { encoding: 'utf-8' });
	} else {
		// TODO: add users to local data
	}

	fs.readFile(DTMM_DATA_PATH, {encoding: 'utf8', flag: 'w+'}, (err, fileData) => {
		if (err) {
			throw err;
		}
		startData = fileData !== '' ? JSON.parse(fileData) : startData;

		fs.readFile(DTMM_LOCAL_DATA_PATH, {encoding: 'utf8', flag: 'w+'}, (err, localData) => {
			if (err) {
				throw err;
			}
	
			startLocalData = localData !== '' ? JSON.parse(localData) : startLocalData;
			init(JSON.parse(sfdx), startData, startLocalData);
		});
	});
	
});

init = (config, data, localData) => {
	var obj = {};
	obj.watch = [];
	obj.watch.push(config.packageDirectories.find((i)=> i.default).path);
	obj.exec = "echo 'Watching for changes ...'";
	obj.ext = "cls,xml,json,js,trigger,cpm,css,design,svg";
	obj.delay = "2500";
	obj.verbose = true;

	nodemon(obj);

	if (data.features.length === 0) data.features.push(localData.currentFeature);

	console.log('local: ' + localData);
	console.log(data);

	if (data.features.filter(v => v.name === localData.currentFeature.name).length === 0) data.features.push(localData.currentFeature);

	chokidar.watch(obj.watch).on('all', (event, path) => {
		
		switch(event) {
			case 'add':
				localData.watch.push({
					path
				});
				break;
			case 'change': 
				let file = {
					path,
					lastDeploy: ''
				}
				localData.currentFeature.files = addFileToList(file, localData.currentFeature.files);
				updateCurrentFeatureOnData(data, localData);
				break;
			case 'unlink':
				localData.watch = localData.watch.filter(v => v.path !== path);
				localData.currentFeature.files = removeFileFromList(localData.currentFeature.files, file);
				updateCurrentFeatureOnData(data, localData);
				break;
		}
		
		log(LOG_WARNING, event, path + ' => ' + JSON.stringify(data));
		fs.writeFile(DTMM_DATA_PATH, JSON.stringify(data), (err) => {if (err) throw err});
		fs.writeFile(DTMM_LOCAL_DATA_PATH, JSON.stringify(localData), (err) => {if (err) throw err});
	});
}

var addFileToList = (file, list) => {
	return list.filter(v => v.path === file.path).length > 0 ? list : list.concat([file]);
}

var removeFileFromList = (file, list) => {
	return list.files = list.files.filter(v => v.path !== path);
}

var updateCurrentFeatureOnData = (data, localData) => {
	return data.features = data.features.map(v => {
		if (v.name === localData.currentFeature.name) {
			v = localData.currentFeature;
		}
		return v;
	});
}