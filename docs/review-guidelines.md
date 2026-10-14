# Review and merge guidelines

Use these guidelines for human and AI review of webgpu-devtools PRs. Follow the [development flow and English collaboration-language policy](development-flow.md#collaboration-language).

## Read the source Issue

Read the source Issue, PR description, complete diff, and available validation results. Compare the implementation with the Issue's problem, expected outcome, and acceptance criteria.

Verify both completeness and scope:

- All requirements claimed as resolved are implemented. If the PR is intentionally partial, its description must say so and must not claim to close the Issue.
- Each change is justified by the Issue. Request removal of unrelated refactoring, speculative frameworks, unnecessary abstractions, or configuration without a demonstrated need.
- The change is correct, fits the existing implementation, and updates affected documentation.

Prefer the smallest change that completely addresses the Issue.

## Check validation and acceptance

Require mandatory pre-merge acceptance criteria to be achievable and verifiable before merge. Check the evidence for each criterion and assess whether validation covers the changed files and resulting behavior.

Use the actual tooling described in the [development guidance](development-flow.md#2-implement-and-validate). `npm run build` is the webpack build; `npm test` is a failing placeholder, not a test suite. For templates/documentation-only changes, check template/Markdown syntax, links and anchors, whitespace, and consistency. Do not demand unrelated runtime suites, device checks, or deployed-site verification for those changes.

Validation claims must accurately distinguish checks performed and their results from failures, skipped checks, and unperformed checks. Optional validation is not a blocking acceptance criterion. Require human confirmation, physical-device testing, subjective evaluation, or external approval only when the actual Issue needs it, with a reason and an expected result.

Keep genuinely necessary post-merge verification separate and pending until performed. For example, merging may trigger deployment; applicable code/configuration, build, and automated checks happen before merge, while publication and the newly published site can be verified only afterward. Pre-merge evidence does not prove deployment or publication succeeded. Pending checks possible only after merge are not pre-merge approval conditions and do not waive implementation requirements or applicable pre-merge checks.

## Decide the review outcome

Distinguish these outcomes clearly in the review or workflow result:

- **Changes requested — agent-fixable findings:** identify the missing requirement or defect, relevant location, reason it blocks acceptance, and expected correction. Have the agent revise the PR, then review the updated diff and relevant validation again. Do not approve while blocking findings remain.
- **Human input required — waiting:** when a necessary decision, confirmation, or evidence cannot be supplied by the agent, record the specific question, why it is required, and what answer or evidence is expected. Use the workflow's wait path and resume review after the answer arrives. If no automated wait path is available, preserve this state and wait for the answer without repeatedly requesting code fixes. Track any independent agent-fixable findings separately; do not label missing human input as a code defect. Necessary pre-merge human confirmation must be resolved before approval.
- **Approved — ready to merge:** approve and merge through the authorized workflow when the Issue is fully addressed, the implementation is correct, scope is justified, mandatory pre-merge checks are sufficient and pass, and no blocking findings or necessary pre-merge questions remain. Follow applicable repository protections. Do not block approval on checks possible only after merge.

After merge, perform only the recorded required post-merge checks. Report their actual results and any follow-up; leave unperformed checks pending. If none are required, state that explicitly rather than inventing a deployment or hardware requirement.

Adapted from GitWeave's [review guidelines](https://github.com/takahirox/gitweave/blob/main/docs/review-guidelines.md).
