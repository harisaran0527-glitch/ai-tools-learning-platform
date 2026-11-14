export const CRITERIA = [
  ["Task / Goal", 15],
  ["Context", 15],
  ["Requirements", 20],
  ["Constraints", 15],
  ["Input / Reference", 10],
  ["Output Format", 10],
  ["Style / Tone", 5],
  ["Validation / Success Criteria", 10],
] as const;
export const CHALLENGES = [
  [
    "Portfolio website",
    "Create a portfolio for a junior designer applying to studios. Include selected work, accessible navigation and a contact section.",
  ],
  [
    "Presentation creation",
    "Plan a ten-minute presentation introducing AI literacy to new teachers.",
  ],
  [
    "Research summarization",
    "Summarize a supplied research paper for a non-specialist audience without inventing evidence.",
  ],
  [
    "Image generation",
    "Create an image brief for an original sustainable travel campaign.",
  ],
  [
    "Coding",
    "Ask for a tested, accessible search component for a React application.",
  ],
  [
    "Lesson plan",
    "Design a 45-minute lesson on fractions for a mixed-ability class.",
  ],
  [
    "Professional email",
    "Write a respectful email requesting a revised project deadline.",
  ],
  [
    "Data analysis",
    "Analyze a supplied sales dataset and distinguish observations from assumptions.",
  ],
  [
    "App creation",
    "Specify a personal budgeting app with accessible forms and private data.",
  ],
  [
    "Content creation",
    "Plan an evidence-based social media series for a local library.",
  ],
];
export const qualityBand = (score: number) =>
  score < 40
    ? "Needs Improvement"
    : score < 60
      ? "Developing Prompt"
      : score < 75
        ? "Good Prompt"
        : score < 90
          ? "Strong Prompt"
          : "Excellent Prompt";
export interface Analysis {
  score: number;
  ticket?: string;
  mode?: "ai" | "rule-based";
  provider?: string;
  label?: string;
  notice?: string;
  sections: {
    label: string;
    max: number;
    score: number;
    status: "Complete" | "Improve" | "Missing";
    evidence: string;
    feedback: string;
  }[];
}
