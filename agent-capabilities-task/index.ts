import task = require('vsts-task-lib/task');
import * as rpn from 'request-promise-native';
import * as vsts from 'vso-node-api';

function getRequestOptions(options: any): any {
    var baseOptions = {
        auth: {
            //bearer: task.getVariable('System.AccessToken')
            bearer: task.getVariable('AgentCapabilitiesAccessToken')
        },
        json: true,
        qs: {},
        rejectUnauthorized: false
    }
    options = Object.assign(baseOptions, options);
    options.qs = Object.assign(options.qs, { 'api-version': '4.1' });

    return options;
}

async function run() {
    try {
        //let enableAccessToken = task.getVariable('system.enableAccessToken');
        //if (!enableAccessToken || !(enableAccessToken.toLowerCase() === 'true')) {
        //    throw new Error('\'Allow scripts to access OAuth token\' must be enabled.');
        //}

        //let baseUri = task.getVariable('system.teamFoundationCollectionUri');
        let collectionUri = task.getVariable('system.teamFoundationCollectionUri');
        let projectId = task.getVariable('system.teamProjectId');
        //let definitionId = task.getVariable('system.definitionId');
        let buildId: number = Number(task.getVariable('build.buildId'));

        //let definitionUri = `${baseUri}${projectId}/_apis/build/definitions/${definitionId}`;
        //let buildUri = `${baseUri}${projectId}/_apis/build/builds/${buildId}`;
        //task.debug(`definitionUri=${definitionUri}`);
        //task.debug(`buildUri=${buildUri}`);

        /*var buildOptions = getRequestOptions(
            {
                uri: buildUri
            }
        );

        let buildResponse: any = await rpn(buildOptions);
        task.debug(JSON.stringify(buildResponse));
        */



        // ideally from config
        let token = task.getVariable('AgentCapabilitiesAccessToken');

        let authHandler = vsts.getPersonalAccessTokenHandler(token);
        let connection = new vsts.WebApi(collectionUri, authHandler);

        let api = await connection.getBuildApi();
        let build = await api.getBuild(buildId, projectId);

        let poolId = build.queue.pool.id;

        let agentId = Number(task.getVariable('agent.id'));

        let poolApi = await connection.getTaskAgentApi();
        let agent = await poolApi.getAgent(poolId, agentId, true);

        task.debug(JSON.stringify(agent.userCapabilities));
        task.debug(JSON.stringify(agent.systemCapabilities));


        task.setResult(task.TaskResult.Succeeded, 'Succeeded');
    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();