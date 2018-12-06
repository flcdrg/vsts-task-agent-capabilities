import task = require('azure-pipelines-task-lib/task');
import * as vsts from 'vso-node-api';
import { TaskAgent } from 'vso-node-api/interfaces/TaskAgentInterfaces';

async function run() {
    try {
        let token = task.getInput('personalAccessToken', true);

        let collectionUri = task.getVariable('system.teamFoundationCollectionUri');

        let authHandler = vsts.getPersonalAccessTokenHandler(token);

        let connection = new vsts.WebApi(collectionUri, authHandler);

        let projectId = task.getVariable('system.teamProjectId');
        let buildId: number = Number(task.getVariable('build.buildId'));
        let agentId = Number(task.getVariable('agent.id'));

        let agent: TaskAgent;
        try{
            let buildApi = await connection.getBuildApi();
            let build = await buildApi.getBuild(buildId, projectId);
            let poolId = build.queue.pool.id;
            let agentApi = await connection.getTaskAgentApi();
            agent = await agentApi.getAgent(poolId, agentId, true);
        }
        catch(err){
            task.debug(`Error getting agent: ${err}`);
            throw new Error('Invalid personal access token. Make sure the token is valid and active.');
        }

        console.log('Agent capability variables and values. Format: variable=value');
        console.log();

        function setTaskVariables(kind: string, capabilities: any) {
            const keys = Object.keys(capabilities);

            for (const key of keys) {
                const formattedKey = `AgentCapabilities.${kind}.${key}`;
                const value = capabilities[key];
                task.setVariable(formattedKey, value);
                console.log(`${formattedKey}=${value}`);
            }
        }

        setTaskVariables('System', agent.systemCapabilities);
        setTaskVariables('User', agent.userCapabilities);

        task.setResult(task.TaskResult.Succeeded, 'Succeeded');
    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();