export const designPromptIntro =
  "Implement my interface using this DESIGN.md as the source of truth:";
export const designPromptGuidance =
  "Preserve its tokens, component states, and accessibility guidance. Adapt layout and content to the product.";

export const buildDesignPrompt = (designMdUrl: string) => `${designPromptIntro}
${designMdUrl}

${designPromptGuidance}`;
