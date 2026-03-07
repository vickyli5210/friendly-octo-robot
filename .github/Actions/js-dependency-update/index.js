const core = require('@actions/core');
const exec = require('@actions/exec');
const { GitHub } = require('@actions/github/lib/utils');
const
// Note: Allows only letters, numbers, `_`, `-`, `.`, and `/` in branch names as a basic safety check.
const validateBranchName = (branchName) => /^[a-zA-Z0-9_\-\.\/]+$/.test(branchName);
// Note: Allowlist validation helps reduce script-injection risk by rejecting shell metacharacters in path-like inputs.
const validateDirectoryName = (directoryName) => /^[a-zA-Z0-9_\-\.\/]+$/.test(directoryName);

async function run(){
    // another safety measure; if there is no default defined in action.yaml, the getInput will return an empty string, which will fail the validation and prevent potential command injection; if there is a default defined in action.yaml, it will be used if the input is not provided, and it should also pass the validation if it's a valid branch name or directory name., so it adds an extra layer of safety by ensuring that even default values are validated.
    const baseBranch = core.getInput('base-branch',[{ required: true }]);
    const targetBranch = core.getInput('target-branch',{ required: true });
    const githubToken = core.getInput('gh-token',[{ required: true }]);
    const workingDir = core.getInput('working-directory', { required: true });
    const debug = core.getBooleanInput('debug');

    const commonExecOpts = { cwd: workingDir };

    // Note: setSecret masks this token in workflow logs (redaction); it does not validate scope/permissions.
    if (githubToken) {
        core.setSecret(githubToken);
    }
    if (!validateBranchName(baseBranch)) {
        core.setFailed(`Invalid base branch name: ${baseBranch}; only letters, numbers, '_', '-', '.', and '/' are allowed.`);
        return;
    }
    if (!validateBranchName(targetBranch)) {
        core.setFailed(`Invalid target branch name: ${targetBranch}; only letters, numbers, '_', '-', '.', and '/' are allowed.`);
        return;
    }
    if (!validateDirectoryName(workingDir)) {
        core.setFailed(`Invalid working directory name: ${workingDir}; only letters, numbers, '_', '-', '.', and '/' are allowed.`);
        return;
    }
    core.info(`Inputs - baseBranch: ${baseBranch}, targetBranch: ${targetBranch}, workingDir: ${workingDir}, debug: ${debug}`);
    await exec.exec('npm', ['update'], { ...commonExecOpts });

    const gitStatusOutput = await exec.getExecOutput(
        'git',
        ['status', '--porcelain', '--', 'package.json', 'package-lock.json'],
        { ...commonExecOpts }
    );
    if (gitStatusOutput.stdout.trim().length > 0) {
        core.info(' [JS-dependency-update] Dependency updates detected, proceeding to commit and create PR.');
        await exec.exec('git', ['config', '--global', 'user.name', '"gh-automation"']);
        await exec.exec('git', ['config', '--global', 'user.email', '"gh-automation@example.com"']);
        await exec.exec('git', ['checkout', '-b', targetBranch], { ...commonExecOpts });
        await exec.exec('git', ['add', 'package.json', 'package-lock.json'], { ...commonExecOpts });
        await exec.exec('git', ['commit', '-m', 'Update JavaScript dependencies'], { ...commonExecOpts });
    //    for real life, rebase first and then push the new changes ocne rebase is successful; for demo purpose, we can directly push with force to simplify the flow, but it is not recommended for production use as it can overwrite history and cause issues for collaborators.
        await exec.exec('git', ['push', 'origin', targetBranch, '--force'], { ...commonExecOpts });
        // Note: The PR creation step is simplified here; in a production action, you would use the GitHub API (e.g., via octokit) to create a PR with proper error handling and messaging.
    
    const octokit = githubToken.getOctokit(githubToken);
        try{
            await octokit.rest.pulls.create({
            owner: GitHub.context.repo.owner,
            repo: GitHub.context.repo.repo,
            title: `Update JS dependencies - ${targetBranch}`,
            head: targetBranch,
            base: baseBranch,
            body: 'This PR updates JavaScript dependencies to their latest versions.'
            });
        }catch(e){
            core.error(`PR creation failed:; please check the log below`);
            core.setFailed(`Failed to create PR: ${e.message}`);
            //  mainly for visibility and debugging, not for control flow. Keep at least one warning log in the catch block so failures are visible in workflow output
            core.error(e);
        }
    
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