import task = require('vsts-task-lib/task');
import * as rc from 'typed-rest-client/RestClient';

interface TaskAgentPoolReference {
    id: number;
    isHosted: boolean;
    name: string;
}

interface AgentPoolQueue {
    pool: TaskAgentPoolReference;
}

interface BuildDefinition {
    queue: AgentPoolQueue;
}

function getRequestOptions(options: any): any {
    var baseOptions = {
        auth: {
            bearer: task.getVariable('System.AccessToken')
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
        let enableAccessToken = task.getVariable('system.enableAccessToken');
        if (!enableAccessToken || !(enableAccessToken.toLowerCase() === 'true')) {
            throw new Error('\'Allow scripts to access OAuth token\' must be enabled.');
        }

        let baseUri = task.getVariable('system.teamFoundationServerUri');
        let projectId = task.getVariable('system.teamProjectId');
        let definitionId = task.getVariable('system.definitionId');

        let definitionUri = `${baseUri}${projectId}/_apis/build/definitions/${definitionId}`;
        task.debug(`definitionUri=${definitionUri}`);

        let rest: rc.RestClient = new rc.RestClient('agent-capabilities');

        var definitionOptions = getRequestOptions({});

        let definitionResponse : rc.IRestResponse<BuildDefinition> = await rest.get<BuildDefinition>(definitionUri, definitionOptions);

        task.debug(definitionResponse.statusCode.toString());

        task.setResult(task.TaskResult.Succeeded, 'Succeeded');
    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();