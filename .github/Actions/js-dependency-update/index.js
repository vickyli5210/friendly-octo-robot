const core = require('@actions/core');
const exec = require('@actions/exec');
// Note: Allows only letters, numbers, `_`, `-`, `.`, and `/` in branch names as a basic safety check.
const validateBranchName = (branchName) => /^[a-zA-Z0-9_\-\.\/]+$/.test(branchName);
// Note: Allowlist validation helps reduce script-injection risk by rejecting shell metacharacters in path-like inputs.
const validateDirectoryName = (directoryName) => /^[a-zA-Z0-9_\-\/]+$/.test(directoryName);

async function run(){
    const baseBranch = core.getInput('base-branch');
    const targetBranch = core.getInput('target-branch');
    const githubToken = core.getInput('github-token');
    const workingDir = core.getInput('working-dir');
    const debug = core.getBooleanInput('debug');

    // Note: setSecret masks this token in workflow logs (redaction); it does not validate scope/permissions.
    core.setSecret(githubToken);
    if (!validateBranchName(baseBranch)) {
        core.setFailed(`Invalid base branch name: ${baseBranch}; only letters, numbers, '_', '-', '.', and '/' are allowed.`);
        return;
    }
    if (!validateBranchName(targetBranch)) {
        core.setFailed(`Invalid target branch name: ${targetBranch}; only letters, numbers, '_', '-', '.', and '/' are allowed.`);
        return;
    }
    if (!validateDirectoryName(workingDir)) {
        core.setFailed(`Invalid working directory name: ${workingDir}; only letters, numbers, '_', '-', and '/' are allowed.`);
        return;
    }
    core.info(`Inputs - baseBranch: ${baseBranch}, targetBranch: ${targetBranch}, workingDir: ${workingDir}, debug: ${debug}`);
    await exec.exec('npm', ['update'], { cwd: workingDir });

    // const gitStatusOutput = await exec.getExecOutput('git', ['status', '-s', 'package*.json'], { cwd: workingDir });
    // if (gitStatusOutput.stdout.trim() === '') {
    //     core.info('No dependency updates found. Exiting action.');
    //     return;
    // }
    if (gitStatusOutput.stdout.trim().length > 0) {
        core.info(' [JS-dependency-update] Dependency updates detected, proceeding to commit and create PR.');
    }else {
        core.info(' [JS-dependency-update] No dependency updates detected after npm update. Exiting action.');
        return;
    }

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