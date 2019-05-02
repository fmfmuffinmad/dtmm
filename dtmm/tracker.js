import log from './utils/log';
import * as consts from './consts';
import nodemon from 'nodemon';
import chokidar from 'chokidar';
import fs from 'fs';
import {execSync} from 'child_process';

var startData = {
	features: [],
	files: []
};

var startLocalData = {
	watch: [],
	currentFeature: {
		name: 'default',
		files: [],
		lastDeploy: ''
	}
};

fs.readFile(consts.SFDX_CONFIG_PATH, {encoding: 'utf8', flag: 'r+'}, (err, sfdx) => {
	if (err) {
		if ( err.code = 'ENOENT') {
			log(consts.LOG_ERROR, 'config', 'No sfdx-project.json found! Please create a SFDX project... and authorize, jackass...');
			process.exit();
		}
	}

	// Check if user has authorized orgs configured on their SFDX files
	log(consts.LOG_MESSAGE, 'sfdx', 'Checking avaliable orgs...');
	let sfdx_orgs = JSON.parse(execSync(`sfdx force:org:list --json`, { encoding: 'utf-8' }));
	if (sfdx_orgs.status !== 0) {
		log(consts.LOG_ERROR, 'sfdx', sfdx_orgs.message);
		log(consts.LOG_WARNING, 'dtmm', 'Requesting auth... Stand by for incoming BROWSER HACKS... just kiddin, we need you to authorize a org... ');
		execSync(`sfdx force:auth:web:login --setalias default-dev --instanceurl https://test.salesforce.com --setdefaultusername`, { encoding: 'utf-8' });
		process.exit();
	} else {
		console.log(sfdx_orgs);
	}

	fs.readFile(consts.DTMM_DATA_PATH, {encoding: 'utf8', flag: 'r'}, (err, fileData) => {
		if (err) {
			//throw err;
			if (err.message === 'ENOENT') {
				fs.writeFile(consts.DTMM_DATA_PATH, JSON.stringify(startData), (err) => {if (err) throw err});
			}
		}
		if (fileData) startData = fileData !== '' ? JSON.parse(fileData) : startData;

		fs.readFile(consts.DTMM_LOCAL_DATA_PATH, {encoding: 'utf8', flag: 'r'}, (err, localData) => {
			if (err) {
				if (err.message === 'ENOENT') {
					fs.writeFile(consts.DTMM_LOCAL_DATA_PATH, JSON.stringify(startLocalData), (err) => {if (err) throw err});
				}
			}
			
			if (localData) startLocalData = localData !== '' ? JSON.parse(localData) : startLocalData;
			init(JSON.parse(sfdx), startData, startLocalData);
		});
	});
	
});

const init = (config, data, localData) => {
	var obj = {};
	obj.watch = [];
	obj.watch.push(config.packageDirectories.find((i)=> i.default).path);
	obj.exec = "echo 'Watching for changes ...'";
	obj.ext = "cls,xml,json,js,trigger,cpm,css,design,svg";
	obj.delay = "2500";
	obj.verbose = true;

	nodemon(obj);

	if (data.features.length === 0) data.features.push(localData.currentFeature);

	if (data.features.filter(v => v.name === localData.currentFeature.name).length === 0) data.features.push(localData.currentFeature);

	chokidar.watch(obj.watch).on('all', (event, path) => {
		let file;
		switch(event) {
			case 'add':
				// localData.watch.push({
				// 	path
				// });
				file = {
					path,
					lastDeploy: '',
					lastDeployedBy: ''
				}
				data.files = addFileToList(file, data.files);
				break;
			case 'change': 
				file = {
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
		
		log(consts.LOG_MESSAGE, event, path);
		fs.writeFile(consts.DTMM_DATA_PATH, JSON.stringify(data), (err) => {if (err) throw err});
		fs.writeFile(consts.DTMM_LOCAL_DATA_PATH, JSON.stringify(localData), (err) => {if (err) throw err});
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