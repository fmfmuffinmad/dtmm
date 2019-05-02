import chalk from 'chalk';
import * as consts from '../consts';

const log = (type = LOG_MESSAGE, category = '', message = 'foo') => {
	let tag;
	switch (type) {
		case consts.LOG_MESSAGE:
			tag = chalk.bgCyan.black(`${type}`);
			break;
		case consts.LOG_SUCCESS:
			tag = chalk.green(`${type}`);
			break;
		case consts.LOG_WARNING:
			tag = chalk.yellow(`${type}`);
			break;
		case consts.LOG_ERROR:
			tag = chalk.red(`${type}`);
			break;
	}
	console.log(`dtmm ${tag} ${chalk.magenta(category)} ${message}`);
};

export default log;