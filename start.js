import fs from 'fs';
import consts from './dtmm/consts';
import log from './dtmm/utils/log';

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

var startConfig = {
    hasSFDXProject: false,
    orgslist: []
}

// verify if config file is created
fs.readFile('./dtmm/dtmm-config.json', {encoding: 'utf8', flag: 'r+'}, (err, config) => {
    if (err) {
		if ( err.code = 'ENOENT') {
            fs.writeFile('./dtmm/dtmm-config.json', JSON.stringify(startConfig), (err) => {if (err) throw err});
		}
    } else {
        startConfig = JSON.parse(config);
    }
    
});

fs.readFile(consts.SFDX_CONFIG_PATH, {encoding: 'utf8', flag: 'r+'}, (err, sfdx) => {
	if (err) {
		if ( err.code = 'ENOENT') {
			log(consts.LOG_ERROR, 'config', 'No sfdx-project.json found! Please create a SFDX project... and authorize, jackass...');
			process.exit();
		}
    }

    startConfig.hasSFDXProject = true;

    if (startConfig.orgslist.length === 0) {
        log(consts.LOG_MESSAGE, 'sfdx', 'Checking avaliable orgs...');
        let sfdx_orgs = JSON.parse(execSync(`sfdx force:org:list --json`, { encoding: 'utf-8' }));
        if (sfdx_orgs.status !== 0) {
            log(consts.LOG_ERROR, 'sfdx', sfdx_orgs.message);
            log(consts.LOG_WARNING, 'dtmm', 'Requesting auth... Stand by for incoming BROWSER HACKS... just kiddin, we need you to authorize a org... ');
            execSync(`sfdx force:auth:web:login --setalias default-dev --instanceurl https://test.salesforce.com --setdefaultusername`, { encoding: 'utf-8' });
            process.exit();
        } else {
            startConfig.orgslist = sfdx_orgs.result.nonScratchOrgs;
        }
    }

    fs.writeFile('./dtmm/dtmm-config.json', JSON.stringify(startConfig), (err) => {if (err) throw err});
});