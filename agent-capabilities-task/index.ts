import task = require('vsts-task-lib/task');

async function run() {
    try {
        let enableAccessToken = task.getVariable('system.enableAccessToken');
        if (!enableAccessToken || !(enableAccessToken.toLowerCase() === 'true')) {
            throw new Error('\'Allow scripts to access OAuth token\' must be enabled.');
        }

        task.setResult(task.TaskResult.Succeeded, 'Succeeded');
    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();