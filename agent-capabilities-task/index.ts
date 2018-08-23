import task = require('vsts-task-lib/task');
import * as vsts from 'vso-node-api';

async function run() {
    try {
        let token = task.getInput('personalAccessToken', true);

        let collectionUri = task.getVariable('system.teamFoundationCollectionUri');
        let projectId = task.getVariable('system.teamProjectId');
        let buildId: number = Number(task.getVariable('build.buildId'));

        let authHandler = vsts.getPersonalAccessTokenHandler(token);
        let connection = new vsts.WebApi(collectionUri, authHandler);

        let api = await connection.getBuildApi();
        let build = await api.getBuild(buildId, projectId);

        let poolId = build.queue.pool.id;

        let agentId = Number(task.getVariable('agent.id'));

        let poolApi = await connection.getTaskAgentApi();
        let agent = await poolApi.getAgent(poolId, agentId, true);
        let keys = Object.keys(agent.systemCapabilities);

        for (let key of keys){
            task.debug(key + ': ' + agent.systemCapabilities[key]);

            task.setVariable('agentCapabilities.' + key, agent.systemCapabilities[key]);
        }

        task.debug(JSON.stringify(task.getVariables()));

        task.setResult(task.TaskResult.Succeeded, 'Succeeded');
    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();