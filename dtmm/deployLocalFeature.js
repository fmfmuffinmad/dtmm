var nodemon = require('nodemon');
var chokidar = require('chokidar');
const execSync = require('child_process').execSync;
const log = require('./utils/log');
const fs = require('fs');

const LOG_MESSAGE = 'MSG';
const LOG_SUCCESS = 'SCC';
const LOG_WARNING = 'WRN';
const LOG_ERROR = 'ERR';
const SFDX_CONFIG_PATH = './sfdx-project.json';
const DTMM_CONFIG_PATH = './dtmm/dtmm-config.json';
const DTMM_DATA_PATH = './dtmm/dtmm-data.json';
const DTMM_LOCAL_DATA_PATH = './dtmm/dtmm-local-data.json';

fs.readFile(DTMM_LOCAL_DATA_PATH, {encoding: 'utf8', flag: 'r+'}, (err, sfdx) => {
    let data = JSON.parse(sfdx);

    let files = [];

    data.currentFeature.files.forEach(v => files.push(v.path));

    let res = execSync(`sfdx force:source:deploy --sourcepath "${files.join(',')}" --loglevel fatal`, { encoding: 'utf-8' });
    console.log(res);
});