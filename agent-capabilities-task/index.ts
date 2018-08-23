import task = require('vsts-task-lib/task');
import * as vsts from 'vso-node-api';
import { IBuildApi } from 'vso-node-api/BuildApi';
import { Build } from 'vso-node-api/interfaces/BuildInterfaces';
import { ITaskAgentApi } from 'vso-node-api/TaskAgentApi';
import { TaskAgent } from 'vso-node-api/interfaces/TaskAgentInterfaces';

async function run() {
    try {
        let token = task.getInput('personalAccessToken', true);

        let collectionUri = task.getVariable('system.teamFoundationCollectionUri');

        let authHandler = vsts.getPersonalAccessTokenHandler(token);

        let connection = new vsts.WebApi(collectionUri, authHandler);

        let projectId = task.getVariable('system.teamProjectId');
        let buildId: number = Number(task.getVariable('build.buildId'));

        let buildApi: IBuildApi;
        try{
            buildApi = await connection.getBuildApi();
        }
        catch(err){
            throw new Error('No build api');
        }

        let build: Build;
        try {
            build = await buildApi.getBuild(buildId, projectId);
        }
        catch(err){
            throw new Error('No build');
        }

        let poolId = build.queue.pool.id;

        let agentId = Number(task.getVariable('agent.id'));

        let agentApi: ITaskAgentApi;
        try{
            agentApi = await connection.getTaskAgentApi();
        }
        catch(err){
            throw new Error('No agent api');
        }

        let agent: TaskAgent;
        try{
            agent = await agentApi.getAgent(poolId, agentId, true);
        }
        catch(err){
            throw new Error('No agent');
        }
        
        let keys = Object.keys(agent.systemCapabilities);

        for (let key of keys) {
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