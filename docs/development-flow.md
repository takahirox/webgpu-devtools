# Development flow

This is the development flow for webgpu-devtools, including work by AI agents:
Issue → implementation → PR → review → revision as needed → merge.
Perform post-merge verification only when the Issue requires it.

## Collaboration language

Use English for newly authored templates, development/review/merge documentation, AI instructions, Issue and PR titles and bodies, review comments, and commit messages. This collaboration-language convention does not require translating historical content or changing product localization.

## 1. Start with an Issue

Use the [Issue template](../.github/ISSUE_TEMPLATE/issue.md) to describe the problem, expected outcome, relevant context, reproduction steps where applicable, and concrete completion criteria. An assignee or owner field is not required.

Treat the source Issue as the scope of the work. Choose the smallest change that fully addresses it; avoid unrelated refactoring or speculative frameworks. Clarify genuinely blocking ambiguity before dependent implementation, while continuing work that does not depend on the answer.

Default to completion criteria an AI agent can execute and verify. Require human confirmation, physical-device testing, subjective evaluation, or external approval only when necessary for the actual Issue. Explain why it is needed and what result is expected. Keep optional validation separate from mandatory completion criteria.

All mandatory pre-merge acceptance criteria must be achievable and verifiable before merge. Record genuinely necessary post-merge checks separately; do not add them routinely or make them pre-merge approval conditions. For example, a merge-triggered deployment can be checked only after merge, while applicable code, configuration, build, and test checks belong before merge.

## 2. Implement and validate

The default branch is `main`. Inspect its current files and instructions, reuse equivalent guidance, and preserve useful existing content. Keep changes focused on the source Issue.

The TypeScript implementation is in `src/`; browser extension files are in `extensions/`. See the [README build and local installation instructions](../README.md#how-to-build-and-install-locally) for setup and loading the unpacked extension.

Choose validation based on the changed files and the actual [package scripts](../package.json):

- `npm run build` runs webpack and is relevant to implementation or build changes after installing dependencies as described in the README.
- `npm run watch` runs webpack in watch mode for local development; it is not a finite validation check.
- `npm test` is currently a placeholder that prints `Error: no test specified` and exits with an error. Do not describe it as an automated test suite.
- No lint or Markdown-check script is currently defined. For templates/documentation-only changes, inspect Markdown and template syntax, resolve relative links and heading anchors, check consistency across guidance and templates, and run `git diff --check`. Use available Markdown tooling where appropriate and report what was actually checked.

Documentation-only changes require no new runtime tests, browser/hardware checks, or deployed-site verification. Implementation changes may need focused browser or WebGPU checks when justified by the Issue; explain any necessary device or human dependency instead of requiring it for every change.

## 3. Create a PR for the Issue

Use the [PR template](../.github/pull_request_template.md) and target `main` unless the Issue or assigned workflow specifies another base. Explain the problem, resulting behavior, focused changes, related Issues, and validation actually performed.

Report passing and failing checks, skipped checks, and checks not performed, with reasons. Keep optional validation distinct from mandatory acceptance. A PR may claim to close an Issue only when it fully addresses that Issue; state intentional partial scope explicitly.

List required post-merge verification separately, marked pending, or state that none is required. Pending post-merge checks do not make an otherwise complete implementation partial, but pre-merge evidence does not prove deployment or publication succeeded.

## 4. Review and revise

Apply the [review guidelines](review-guidelines.md) to completeness against the source Issue, correctness, unnecessary scope, and appropriate validation. Request fixes for agent-fixable findings, update the PR, and review the revised changes again.

If genuinely necessary human input is missing, record the specific question, why the answer is necessary, and the expected decision or evidence. Use the workflow's wait path and resume when the answer arrives; do not repeatedly request code fixes for a missing human answer. Keep this state distinct from agent-fixable findings.

## 5. Approve and merge

Approve and merge through the authorized workflow when the implementation fully addresses the Issue, mandatory pre-merge checks are sufficient and pass, and no blocking review findings remain. Follow applicable repository protections. Checks possible only after merge must not block pre-merge approval.

## 6. Perform required post-merge verification

If the Issue requires post-merge checks, perform them after merge and record actual results, including failures and follow-up work. Keep unperformed checks pending. Do not report successful deployment or publication from pre-merge evidence. If no post-merge checks are required, no extra verification step is needed.

Adapted from GitWeave's [development flow](https://github.com/takahirox/gitweave/blob/main/docs/development-flow.md) and [Issue](https://github.com/takahirox/gitweave/blob/main/.github/ISSUE_TEMPLATE/issue.md) and [PR](https://github.com/takahirox/gitweave/blob/main/.github/pull_request_template.md) templates.
