// Build-time shiki highlighting for the skill page: every agent install
// variant, the example prompts, and the SKILL.md mirror. The page switches
// between pre-highlighted variants — no highlighting runs in the browser.
import {
	skillAgents,
	skillCopyFromRepo,
	skillCurl,
	skillExamples,
	skillPrompt,
	skillSource
} from '$site/docs/skill';
import { highlight } from '$site/lib/highlight';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const install: Record<
		string,
		{ project: string; personal: string; repo: string; prompt: string }
	> = {};
	await Promise.all(
		skillAgents.map(async (agent) => {
			install[agent.id] = {
				project: await highlight(skillCurl(agent.project), 'bash'),
				personal: await highlight(skillCurl(agent.personal), 'bash'),
				repo: await highlight(skillCopyFromRepo(agent.project), 'bash'),
				prompt: await highlight(skillPrompt(agent.project), 'text')
			};
		})
	);

	const examples = await Promise.all(skillExamples.map((item) => highlight(item.prompt, 'text')));
	const source = await highlight(skillSource, 'markdown');

	return { install, examples, source };
};
