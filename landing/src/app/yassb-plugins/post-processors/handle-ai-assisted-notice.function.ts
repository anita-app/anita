const AI_ASSISTED_NOTICE_REGEX = /<aside data-ai-assisted="([^"]*)" \/>/g;

export function handleAiAssistedNotice(content: string): string {
  return content.replace(AI_ASSISTED_NOTICE_REGEX, (_match, flag) => {
    const normalizedFlag = `${flag}`.trim().toLowerCase();

    if (normalizedFlag !== 'true') {
      return '';
    }

    return `<aside class="ai-assisted-notice">This article reflects the author's own ideas and reasoning. Since the author is not a native English speaker, AI was used to edit the final wording for clarity and correctness.</aside>`;
  });
}
