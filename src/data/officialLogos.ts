/**
 * Official verified brand logos and CDNs for prominent AI tools.
 * Fallbacks gracefully to high-quality SVG badges or custom uploaded logos.
 */

export const OFFICIAL_TOOL_LOGOS: Record<string, string> = {
  chatgpt: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/openai/openai-original.svg',
  openai: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/openai/openai-original.svg',
  claude: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/anthropic.svg',
  gemini: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlegemini.svg',
  'perplexity-ai': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/perplexity.svg',
  perplexity: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/perplexity.svg',
  'github-copilot': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/githubcopilot.svg',
  elevenlabs: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/elevenlabs.svg',
  'hugging-face': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/huggingface.svg',
  'notion-ai': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/notion.svg',
  runway: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/runway.svg',
  'stable-diffusion': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/stabilityai.svg',
  midjourney: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/midjourney.svg',
  grammarly: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/grammarly.svg',
  canva: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/canva.svg',
  deepseek: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/deepseek.svg',
  mistral: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mistral.svg',
  'suno-ai': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/suno.svg',
};

/**
 * Returns a verified logo URL if available, otherwise returns the tool's configured logo or empty string.
 */
export function getToolLogoUrl(slug?: string, configuredLogo?: string): string {
  if (!slug) return configuredLogo || '';
  const normalizedSlug = slug.toLowerCase().trim();
  if (OFFICIAL_TOOL_LOGOS[normalizedSlug]) {
    return OFFICIAL_TOOL_LOGOS[normalizedSlug];
  }
  return configuredLogo || '';
}
