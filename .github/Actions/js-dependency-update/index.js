const core = require('@actions/core');
const validateBranchName = (branchName) => /^[a-zA-Z0-9_\-\.\/]+$/.test(branchName)){
}
async function run(){
    const baseBranch = core.getInput('base-branch');
    const targetBranch = core.getInput('target-branch');
    const githubToken = core.getInput('github-token');
    const workingDir = core.getInput('working-dir');
    const debug = core.getBooleanInput('debug');

    core.setSecret(githubToken);

    /*
    1. Parse inputs:
        1.1 base-branch from which to check for update
        1.2 target-branch to create for the PR for update
        1.3 GitHub token to use for creating the PR for authentication purpose
        1.4 working directory to run npm commands for checking and updating dependencies
    2. Execute the npm update within the working directory
    3. Check if there are changes after the npm update in package*.json files, 
    4.if there is update, 
        4.1 add and commit files to the target branch
        4.2 create a pr to the base-branch using the octokit API
    5if not, then exit the action 


        */
    core.info('Running JavaScript dependency update action...');
}
run()