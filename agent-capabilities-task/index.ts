import task = require('azure-pipelines-task-lib/task');
import * as vsts from 'vso-node-api';

async function run() {
    try {
        let token = task.getInput('personalAccessToken', true);

        let collectionUri = task.getVariable('system.teamFoundationCollectionUri');

        let authHandler = vsts.getPersonalAccessTokenHandler(token);

        let connection = new vsts.WebApi(collectionUri, authHandler);

        let projectId = task.getVariable('system.teamProjectId');
        let buildId: number = Number(task.getVariable('build.buildId'));
        let agentId = Number(task.getVariable('agent.id'));

        let systemCapabilities;

        try{
            let buildApi = await connection.getBuildApi();
            let build = await buildApi.getBuild(buildId, projectId);
            let poolId = build.queue.pool.id;
            let agentApi = await connection.getTaskAgentApi();
            let agent = await agentApi.getAgent(poolId, agentId, true);
            systemCapabilities = agent.systemCapabilities;
        }
        catch(err){
            throw new Error('Invalid personal access token. Make sure the token is valid and active.');
        }

        let keys = Object.keys(systemCapabilities);

        console.log('Agent capability variables and values. Format: variable=value');
        console.log();

        for (let key of keys) {
            let formattedKey = `AgentCapabilities.${key}`;
            let value = systemCapabilities[key];
            task.setVariable(formattedKey, value);
            console.log(`${formattedKey}=${value}`);
        }

        task.setResult(task.TaskResult.Succeeded, 'Succeeded');
    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();