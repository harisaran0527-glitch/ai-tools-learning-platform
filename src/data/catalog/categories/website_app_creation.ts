import { AITool } from '../../../types/tool';

const makeTool = (id: string, slug: string, name: string, officialUrl: string, docsUrl: string, freePlanDetails: string, subcategory: string): AITool => ({
  id, slug, name, logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${slug}`, category: 'Website / App Creation', subcategory,
  pricingType: 'free-tier', freePlanDetails, signupRequired: true, installationRequired: false, platforms: ['Web'],
  shortDescription: `${name} is an AI-assisted platform for building websites and applications.`,
  fullDescription: `${name} helps faculty turn a brief into a working website or application, then refine the result through visual or code-based controls.`,
  superpower: 'Turns a plain-language product idea into an editable web experience.', difficulty: 'Beginner', learningTime: 25,
  whyLearn: ['Shortens the path from teaching idea to working prototype.', 'Makes app concepts tangible for students and faculty teams.', 'Supports iterative learning through visible design and implementation feedback.'],
  useCases: ['Prototype a faculty portal or course microsite.', 'Build a small data-entry or resource-sharing app.', 'Create a student project scaffold for critique and iteration.'],
  features: [{ title: 'Prompt-to-project generation', description: 'Describe the site or app and receive an editable starting point.' }, { title: 'Iterative refinement', description: 'Improve layout, content, data, and behavior through follow-up instructions.' }, { title: 'Publish or export', description: 'Move from prototype to a hosted experience or exported implementation.' }],
  steps: [{ title: 'Define the outcome', description: 'Write the audience, workflow, data, and success criteria.' }, { title: 'Generate a first version', description: 'Use a precise prompt and inspect the generated pages and logic.' }, { title: 'Test with a faculty scenario', description: 'Run a realistic workflow, correct issues, and document the result.' }],
  practicalExercise: { objective: `Build a small faculty resource app with ${name}.`, input: 'A searchable repository of lesson resources.', examplePrompt: 'Build a responsive faculty resource library with categories, search, a submission form, and an accessible dark interface.', expectedResult: 'A working prototype with a clear content model and tested primary workflow.', skillsLearned: ['Requirements writing', 'AI-assisted iteration', 'Prototype evaluation'] },
  officialUrl, officialStatus: 'verified', docsUrl, docsStatus: 'verified', keywords: [name, 'website', 'app', 'no-code', 'faculty'], verifiedAt: '2026-09-08', lastVerified: '2026-09-08', badge: 'FREE TIER'
});

export const website_app_creation_tools: AITool[] = [
  makeTool('web-1', 'lovable', 'Lovable', 'https://lovable.dev', 'https://docs.lovable.dev/introduction/welcome', 'Free project creation is available; paid plans add more usage and collaboration.', 'AI App Builders'),
  makeTool('web-2', 'bolt', 'Bolt', 'https://bolt.new', 'https://support.bolt.new', 'A free starting mode is available; usage and advanced model access vary by plan.', 'AI App Builders'),
  makeTool('web-3', 'replit', 'Replit', 'https://replit.com', 'https://docs.replit.com', 'Starter includes free daily usage and one published live project according to the current plan page.', 'AI App Builders'),
  makeTool('web-4', 'v0', 'v0', 'https://v0.app', 'https://v0.dev/docs', 'Free credits are available; generation and deployment limits vary by plan.', 'AI App Builders'),
  makeTool('web-5', 'framer-ai', 'Framer AI', 'https://www.framer.com/ai/', 'https://www.framer.com/help/', 'A free starting plan is available; custom domains and advanced publishing require paid plans.', 'AI Website Builders'),
  makeTool('web-6', 'webflow-ai', 'Webflow AI', 'https://webflow.com/ai', 'https://help.webflow.com/', 'Webflow offers a free Starter plan; AI feature access and credits vary by workspace and site plan.', 'AI Website Builders'),
  makeTool('web-7', 'wix-ai', 'Wix AI Website Builder', 'https://www.wix.com/ai-website-builder', 'https://support.wix.com/', 'Wix supports starting a site for free; hosting, domains, and premium features require a plan.', 'AI Website Builders'),
  makeTool('web-8', 'durable', 'Durable', 'https://durable.com', 'https://help.durable.co/', 'A free trial or limited starting experience may be available; verify current credits on signup.', 'AI Website Builders'),
  makeTool('web-9', 'bubble', 'Bubble', 'https://bubble.io/ai-app-builder', 'https://manual.bubble.io/', 'Bubble lets users get started for free; publishing and capacity require paid plans.', 'No-Code App Builders'),
  makeTool('web-10', 'glide', 'Glide', 'https://www.glideapps.com', 'https://www.glideapps.com/docs', 'Glide lists a Free plan; data rows, users, and publishing limits vary by plan.', 'No-Code App Builders'),
  makeTool('web-11', 'softr', 'Softr', 'https://www.softr.io', 'https://docs.softr.io/', 'A free plan is available with limits on users, records, and features.', 'No-Code App Builders'),
  makeTool('web-12', 'flutterflow', 'FlutterFlow', 'https://flutterflow.io', 'https://docs.flutterflow.io/', 'FlutterFlow offers a free starting plan; code export and advanced deployment are plan-dependent.', 'Visual App Builders'),
  makeTool('web-13', 'firebase-studio', 'Firebase Studio', 'https://firebase.google.com/products/studio', 'https://firebase.google.com/docs', 'Access depends on current Google/Firebase availability and quotas; check the official console for limits.', 'AI App Builders'),
  makeTool('web-14', 'base44', 'Base44', 'https://base44.com', 'https://docs.base44.com/', 'Base44 currently advertises a $0/mo starting plan with core features and usage limits.', 'AI App Builders')
];