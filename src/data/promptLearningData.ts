export interface PromptExample {
  id: string;
  component: string; // Exact match to one of the 8 CRITERIA
  title: string;
  explanation: string;
  weakPrompt: string;
  improvedPrompt: string;
  whyBetter: string;
  tips: string[];
  commonMistakes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'english' | 'tamil' | 'tanglish';
  imageUrl?: string;
  status: 'draft' | 'published';
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComponentGuide {
  name: string;
  maxScore: number;
  shortDescription: string;
  howToWrite: string;
  whyImportant: string;
  practicalTips: string[];
  commonMistakes: string[];
  placeholder: string;
  starterPrompt: string;
}

export const COMPONENT_GUIDES: Record<string, ComponentGuide> = {
  "Task / Goal": {
    name: "Task / Goal",
    maxScore: 15,
    shortDescription: "What exact objective should the AI accomplish?",
    howToWrite: "Start with an assertive action verb (Create, Build, Analyze, Summarize, Refactor). Specify the precise deliverable and who it is intended for.",
    whyImportant: "Without a crystal-clear goal, the AI wanders and produces generic commentary rather than an actionable end-product.",
    practicalTips: [
      "Use decisive action verbs: 'Generate a step-by-step tutorial' instead of 'Tell me about'.",
      "Explicitly state the primary deliverable (e.g. guide, script, email, table).",
      "Clarify the intended end user or consumer of the output."
    ],
    commonMistakes: [
      "Vague requests like 'Write something about Python'.",
      "Combining multiple conflicting tasks in one sentence.",
      "Forgetting to name the final asset you want produced."
    ],
    placeholder: "e.g. Write a comprehensive 5-step beginner tutorial explaining how to install Node.js and run a simple HTTP server...",
    starterPrompt: "Create a step-by-step practical guide that..."
  },
  "Context": {
    name: "Context",
    maxScore: 15,
    shortDescription: "Who is the audience and what is the background situation?",
    howToWrite: "Describe your scenario, background, audience skill level, and domain context. Assign an expert persona if specialized knowledge is required.",
    whyImportant: "Context grounds the response in reality. An answer for high-school students is drastically different from an answer for staff engineers.",
    practicalTips: [
      "Specify audience experience (e.g. absolute beginners, 10th-grade students, senior VP).",
      "Explain the broader problem or business background.",
      "Frame the AI's role: 'Act as an empathetic senior frontend mentor'."
    ],
    commonMistakes: [
      "Assuming the AI knows your internal business setup.",
      "Omitting the audience's background and technical depth.",
      "Providing contradictory background information."
    ],
    placeholder: "e.g. Target audience is non-technical high school teachers who have never used an API before...",
    starterPrompt: "Context & Audience: This is for high school students who have no prior programming experience..."
  },
  "Requirements": {
    name: "Requirements",
    maxScore: 20,
    shortDescription: "What specific features, topics, and elements MUST be included?",
    howToWrite: "Enumerate mandatory deliverables using a numbered checklist. Be explicit about syntax, sections, parameters, and key concepts.",
    whyImportant: "This carries the highest weight (20 points). It ensures completeness so you never have to ask repetitive follow-up questions.",
    practicalTips: [
      "Number your requirements: 1), 2), 3) for crisp parsing.",
      "Demand code comments, diagrams, or practical examples.",
      "Mention necessary edge-case handling or safety points."
    ],
    commonMistakes: [
      "Saying 'include everything needed' without defining what 'everything' is.",
      "Burying critical requirements in long paragraphs.",
      "Leaving technical dependencies unspecified."
    ],
    placeholder: "e.g. Must include: 1) Prerequisites checklist, 2) Complete verified code snippets with inline comments, 3) Common error troubleshooting...",
    starterPrompt: "Mandatory Requirements:\n1. Provide step-by-step instructions\n2. Include code examples with explanatory comments\n3. Provide a troubleshooting section"
  },
  "Constraints": {
    name: "Constraints",
    maxScore: 15,
    shortDescription: "What boundaries, restrictions, or things must the AI NOT do?",
    howToWrite: "State explicit limits on length, tools, dependencies, vocabulary, and assumptions. Include clear negative constraints ('Do NOT use...').",
    whyImportant: "Constraints eliminate hallucinations, unnecessary fluff, bloated responses, and unsupported libraries.",
    practicalTips: [
      "Specify hard length bounds (e.g. 'Under 300 words' or 'Maximum 2 paragraphs').",
      "Explicitly ban third-party libraries when native code is needed.",
      "Instruct the model: 'Do not invent unverified facts or assume missing data'."
    ],
    commonMistakes: [
      "Using subjective limits like 'Keep it short' (AI interprets this differently).",
      "Forgetting to forbid deprecated libraries or bloated boilerplate.",
      "Omitting negative constraints entirely."
    ],
    placeholder: "e.g. Keep under 250 words. Do not use external libraries; use only native JavaScript ES6+. Avoid marketing buzzwords...",
    starterPrompt: "Strict Constraints:\n- Maximum length: 250 words\n- Do not use third-party libraries\n- Do not speculate on unverified data"
  },
  "Input / Reference": {
    name: "Input / Reference",
    maxScore: 10,
    shortDescription: "What raw data, notes, or source material should be analyzed?",
    howToWrite: "Paste or enclose the source text, code snippet, dataset, or customer log. Instruct the model to anchor its answer solely in this input.",
    whyImportant: "Grounding the AI in supplied material prevents speculation and guarantees factual accuracy.",
    practicalTips: [
      "Enclose input in triple backticks or explicit tags (e.g. <input>...</input>).",
      "Instruct: 'Base answers strictly on the supplied excerpt'.",
      "If data is absent, state what type of input the model should expect."
    ],
    commonMistakes: [
      "Telling the AI to summarize 'the document' without pasting the document.",
      "Mixing your prompt instructions directly inside the raw data.",
      "Allowing the model to invent facts when the input is incomplete."
    ],
    placeholder: "e.g. Reference the following server log snippet: [ERROR 500 at 10:42 UTC - Database pool exhausted]...",
    starterPrompt: "Reference Input Data:\n\"\"\"\n[Paste raw text, code, or data here]\n\"\"\""
  },
  "Output Format": {
    name: "Output Format",
    maxScore: 10,
    shortDescription: "How should the final response be structured and presented?",
    howToWrite: "Define the visual and structural layout: Markdown table, JSON schema, bulleted list, or step-by-step accordion format.",
    whyImportant: "Proper formatting makes outputs immediately copy-pasteable, parsable by software, and easy for humans to read.",
    practicalTips: [
      "Specify exact table headers (e.g. '| Step | Action | Command | Verification |').",
      "For code, specify language tags (```typescript, ```python).",
      "Request clear subheadings for distinct logical sections."
    ],
    commonMistakes: [
      "Asking for 'clean formatting' without naming Markdown, tables, or JSON.",
      "Forgetting to specify schema fields when requesting JSON.",
      "Allowing conversational chatter before or after structured data."
    ],
    placeholder: "e.g. Output as a clean Markdown table with columns: | Step # | Action | Expected Output | Notes | followed by a copyable code block...",
    starterPrompt: "Format: Deliver as a Markdown document with clear headers (H2, H3), bullet points, and a summary table."
  },
  "Style / Tone": {
    name: "Style / Tone",
    maxScore: 5,
    shortDescription: "What voice, attitude, and writing persona should be used?",
    howToWrite: "State the emotional and professional tone: empathetic, authoritative, conversational, concise, or pedagogical.",
    whyImportant: "Tone aligns the communication with the human reader's emotional context and professional setting.",
    practicalTips: [
      "Combine two complementary tone descriptors: e.g. 'Empathetic yet authoritative'.",
      "Specify reading ease: 'Write at a 9th-grade reading level'.",
      "State whether conversational or formal language is preferred."
    ],
    commonMistakes: [
      "Leaving tone to chance, which defaults to generic AI robotic prose.",
      "Using contradictory descriptors like 'Extremely brief yet fully exhaustive'.",
      "Over-specifying humor or slang that distracts from clarity."
    ],
    placeholder: "e.g. Tone should be professional, encouraging, and clear, avoiding academic jargon...",
    starterPrompt: "Tone: Professional, supportive, and accessible to non-experts."
  },
  "Validation / Success Criteria": {
    name: "Validation / Success Criteria",
    maxScore: 10,
    shortDescription: "How can the AI verify that the result is correct before finishing?",
    howToWrite: "Give the AI a final acceptance checklist to audit its own output. Include self-verification questions before output generation.",
    whyImportant: "Adding self-validation forces the AI's internal reasoning loop to catch errors, omission of requirements, and constraint violations.",
    practicalTips: [
      "Ask the model: 'Before printing, check that all 3 requirements from section 3 are met'.",
      "Include a verification step for math calculations or code syntax.",
      "Demand that all claims have a corresponding rationale."
    ],
    commonMistakes: [
      "Assuming the model self-corrects without an explicit directive.",
      "Writing vague criteria like 'Make sure it is good'.",
      "Omitting verification when strict factual accuracy is needed."
    ],
    placeholder: "e.g. Verify before output: 1) All code commands work in Node 18+, 2) Word count is under 250, 3) No third-party packages are imported...",
    starterPrompt: "Success Criteria:\n- Verify all instructions are fulfilled\n- Ensure code contains zero syntax errors\n- Confirm no requirements were omitted"
  }
};

export const SEED_PROMPT_EXAMPLES: PromptExample[] = [
  // 1. Task / Goal
  {
    id: "ex-task-01",
    component: "Task / Goal",
    title: "Beginner Python Tutorial Goal",
    explanation: "Replaces vague inquiry with a distinct, actionable goal and named deliverable.",
    weakPrompt: "Write something about Python.",
    improvedPrompt: "Write a comprehensive 5-step tutorial teaching complete beginners how to install Python 3.12 on Windows and run their first 'Hello, World!' script in VS Code.",
    whyBetter: "The improved version clearly specifies the task ('write a 5-step tutorial'), target user ('complete beginners'), topic ('install Python 3.12 and run Hello World'), and environment ('Windows with VS Code').",
    tips: [
      "Use strong action verbs like 'Write', 'Build', 'Summarize', 'Refactor'.",
      "Specify the exact scope and end asset produced."
    ],
    commonMistakes: [
      "Using 'Tell me about...' which leads to essays rather than structured solutions.",
      "Leaving the scope open-ended."
    ],
    difficulty: "beginner",
    language: "english",
    status: "published",
    displayOrder: 1
  },
  {
    id: "ex-task-02",
    component: "Task / Goal",
    title: "React Hook Explanation (Tanglish)",
    explanation: "Provides clear scope and target audience in conversational Tanglish.",
    weakPrompt: "ReactJS pathi explain pannu.",
    improvedPrompt: "ReactJS functional components la useState hook epdi work aaguthu nu 3 practical code examples oda complete beginners ku puriyura maari explain pannu.",
    whyBetter: "General ah kekama, specific ah useState hook, 3 practical examples, and complete beginners kaga clarify pannirukku.",
    tips: [
      "Topic ah specific ah narrow down pannunga (e.g. useState).",
      "Ethana examples venum nu mention pannunga."
    ],
    commonMistakes: [
      "Moththa React pathiyum ore prompt la kekurathu.",
      "Audience level mention pannama vidurathu."
    ],
    difficulty: "beginner",
    language: "tanglish",
    status: "published",
    displayOrder: 2
  },
  {
    id: "ex-task-03",
    component: "Task / Goal",
    title: "AI Literacy Article (Tamil)",
    explanation: "செயற்கை நுண்ணறிவு பற்றிய தெளிவான கட்டுரை இலக்கு.",
    weakPrompt: "செயற்கை நுண்ணறிவு பற்றி எழுதுங்கள்.",
    improvedPrompt: "பள்ளி மாணவர்களுக்கு புரியும் வகையில், அன்றாட வாழ்வில் செயற்கை நுண்ணறிவு (AI) எவ்வாறு பயன்படுகிறது என்பதை 5 நிஜ வாழ்க்கை உதாரணங்களுடன் விளக்கும் 300 வார்த்தை கட்டுரை ஒன்றை எழுதுங்கள்.",
    whyBetter: "மாணவர்களுக்கான எளிய மொழி, 5 நிஜ வாழ்க்கை உதாரணங்கள் மற்றும் 300 வார்த்தை வரம்பு தெளிவாகக் குறிப்பிடப்பட்டுள்ளது.",
    tips: [
      "எழுத வேண்டிய கட்டுரையின் அளவு மற்றும் வடிவத்தை முன்கூட்டியே வரையறுக்கவும்.",
      "வாசகர்களின் வயதை அல்லது கல்வி நிலையை சுட்டிக்காட்டவும்."
    ],
    commonMistakes: [
      "பொதுப்படையாக 'AI பற்றி எழுதுங்கள்' என்று கேட்பது.",
      "எத்தனை உதாரணங்கள் தேவை என்பதை குறிப்பிடாமல் விடுவது."
    ],
    difficulty: "intermediate",
    language: "tamil",
    status: "published",
    displayOrder: 3
  },

  // 2. Context
  {
    id: "ex-ctx-01",
    component: "Context",
    title: "High School Physics Teacher Persona",
    explanation: "Provides teaching background, audience grade level, and specific student challenges.",
    weakPrompt: "I am a teacher explaining physics.",
    improvedPrompt: "You are an experienced high school physics teacher. Your audience is 10th-grade students preparing for their first board examination who find electromagnetic induction confusing and abstract.",
    whyBetter: "Identifies the instructor persona, the exact grade level, the upcoming examination context, and the psychological hurdle (confusing/abstract concept).",
    tips: [
      "Describe the audience's current understanding level.",
      "Highlight specific pain points or misconceptions they face."
    ],
    commonMistakes: [
      "Stating 'I am a teacher' without describing the students or curriculum.",
      "Assuming the AI knows the age level automatically."
    ],
    difficulty: "beginner",
    language: "english",
    status: "published",
    displayOrder: 1
  },
  {
    id: "ex-ctx-02",
    component: "Context",
    title: "Organic Grocery Startup (Tanglish)",
    explanation: "Business context, location, and customer persona in Tanglish.",
    weakPrompt: "Enoda grocery business ku ad post venum.",
    improvedPrompt: "Naanga Chennai la fresh farm-to-table organic vegetables deliver panra startup. Target audience: 25-40 age IT professionals and young parents who value pesticide-free healthy food on weekends.",
    whyBetter: "City (Chennai), business model (farm-to-table organic), and customer profile (working professionals & young parents) ellam details kuduthurukku.",
    tips: [
      "Ungaloda location and target demographic mention pannunga.",
      "Customer oda real pain-point ah reflect pannunga."
    ],
    commonMistakes: [
      "Generic marketing pitch kekurathu.",
      "Location and target age group mention pannama vidurathu."
    ],
    difficulty: "intermediate",
    language: "tanglish",
    status: "published",
    displayOrder: 2
  },
  {
    id: "ex-ctx-03",
    component: "Context",
    title: "Rural Education Initiative (Tamil)",
    explanation: "கிராமப்புற கல்வி மற்றும் இணைய சூழல் பின்னணி.",
    weakPrompt: "கல்வி திட்டம் பற்றி சொல்லுங்கள்.",
    improvedPrompt: "நாங்கள் கிராமப்புற அரசுப் பள்ளி மாணவர்களுக்கு இலவசமாக டிஜிட்டல் கல்வி வழங்கும் தொண்டு நிறுவனம். கிராமங்களில் குறைந்த இணைய வேகம் (Low bandwidth) மற்றும் எளிய ஸ்மார்ட்போன்கள் மட்டுமே பயன்பாட்டில் உள்ள சூழலை கருத்தில் கொள்ளவும்.",
    whyBetter: "தொழில்நுட்ப வரம்புகள் மற்றும் மாணவர்களின் எதார்த்த நிலையை AI சரியாகப் புரிந்து கொள்ள உதவுகிறது.",
    tips: [
      "உள்ளூர் கள நிலவரங்களை (Local constraints) AI-க்கு விளக்குங்கள்.",
      "பயனாளர்களின் சமூகப் பொருளாதாரப் பின்னணியை குறிப்பிடுங்கள்."
    ],
    commonMistakes: [
      "நகர்ப்புற வசதிகள் அனைவருக்கும் உண்டு என தவறாக அனுமானிப்பது.",
      "பயனாளர்களின் சாதன வசதிகளை குறிப்பிடாமல் இருப்பது."
    ],
    difficulty: "advanced",
    language: "tamil",
    status: "published",
    displayOrder: 3
  },

  // 3. Requirements
  {
    id: "ex-req-01",
    component: "Requirements",
    title: "Full-Stack API Design Deliverables",
    explanation: "Numbers every mandatory feature and technical specification.",
    weakPrompt: "Include good authentication and API details.",
    improvedPrompt: "Mandatory Requirements:\n1. Express.js REST route for /api/login with bcrypt password comparison.\n2. JWT generation with 1-hour expiration and signed secret.\n3. HttpOnly cookie storage configuration to prevent XSS.\n4. Error response returning RFC 7807 standard JSON format.",
    whyBetter: "Replaces vague 'good authentication' with 4 numbered, testable, concrete deliverables with exact security standards (bcrypt, JWT 1hr, HttpOnly, RFC 7807).",
    tips: [
      "Use numbered lists for mandatory elements.",
      "Specify library versions, security standards, and exact parameter names."
    ],
    commonMistakes: [
      "Writing 'make it secure' without naming security mechanisms.",
      "Mixing requirements into a long unstructured paragraph."
    ],
    difficulty: "advanced",
    language: "english",
    status: "published",
    displayOrder: 1
  },
  {
    id: "ex-req-02",
    component: "Requirements",
    title: "E-Commerce Checkout Requirements (Tanglish)",
    explanation: "Clear checklist of required features in Tanglish.",
    weakPrompt: "Checkout page la ella options um venum.",
    improvedPrompt: "Kandippa include panna vendiya points:\n1. Total bill breakdown (Product cost, GST 18%, and delivery charge).\n2. Multiple payment options: UPI QR code, Credit/Debit card, and Net Banking.\n3. Delivery address selector with pincode verification.\n4. Order confirmation SMS trigger logic.",
    whyBetter: "Vague ah illama bill breakdown, GST %, UPI, card, and pincode check nu precise requirements list pannirukku.",
    tips: [
      "Checklist maari 1, 2, 3 nu split pannunga.",
      "Payment and address verification criteria specify pannunga."
    ],
    commonMistakes: [
      "'Standard checkout options' nu general ah solrathu.",
      "Taxes and verification steps miss panrathu."
    ],
    difficulty: "intermediate",
    language: "tanglish",
    status: "published",
    displayOrder: 2
  },

  // 4. Constraints
  {
    id: "ex-con-01",
    component: "Constraints",
    title: "Zero-Dependency JavaScript Constraints",
    explanation: "Imposes strict length limits and forbids external dependencies.",
    weakPrompt: "Keep it simple and not too long.",
    improvedPrompt: "Strict Constraints:\n- Maximum word count: 200 words.\n- Do NOT import any external packages (no npm, no Lodash, no jQuery); use only native ES2022 JavaScript.\n- Do NOT write commentary before or after the code block.\n- Avoid any marketing fluff or conversational intros.",
    whyBetter: "Quantifies the word ceiling (200 words), forbids external dependencies categorically, and eliminates conversational filler.",
    tips: [
      "Give an exact word or character ceiling.",
      "State explicit negative rules using 'Do NOT...'."
    ],
    commonMistakes: [
      "Writing 'Keep it short' (which could mean 10 words or 500 words to an AI).",
      "Forgetting to ban third-party dependencies when writing embedded code."
    ],
    difficulty: "beginner",
    language: "english",
    status: "published",
    displayOrder: 1
  },
  {
    id: "ex-con-02",
    component: "Constraints",
    title: "Strict Budget and Tech Limits (Tanglish)",
    explanation: "No-code and budget boundaries in Tanglish.",
    weakPrompt: "Romba costly tools sollathinga.",
    improvedPrompt: "Strict Constraints:\n- Purely free or open-source tools mattum thaan recommend pannanum (zero budget).\n- Paid SaaS or subscription tools mention panna koodathu.\n- Coding knowledge thevai illaatha no-code solutions ah irukkanum.\n- Summary length 3 bullet points ku mela irukka koodathu.",
    whyBetter: "Zero budget, no paid tools, no-code only, and max 3 bullets nu crystal-clear boundaries set pannirukku.",
    tips: [
      "Budget limits and tool categories mention pannunga.",
      "Max bullet point count specify pannunga."
    ],
    commonMistakes: [
      "'Cheap tools' nu vague ah solrathu.",
      "No-code requirement specify pannama code solutions varuthu nu complain panrathu."
    ],
    difficulty: "intermediate",
    language: "tanglish",
    status: "published",
    displayOrder: 2
  },

  // 5. Input / Reference
  {
    id: "ex-inp-01",
    component: "Input / Reference",
    title: "Customer Support Log Analysis",
    explanation: "Anchors the answer strictly in verified quotation data.",
    weakPrompt: "Look at our customer problems and summarize them.",
    improvedPrompt: "Reference the following customer support ticket verbatim:\n\"Ticket #4092: After updating to v2.4, the bulk export button triggers error code 504 Gateway Timeout whenever CSV rows exceed 10,000.\"\nAnalyze solely the error stated above. Do not infer any unmentioned server causes.",
    whyBetter: "Quotes the exact ticket text and forbids the AI from fabricating unstated causes.",
    tips: [
      "Wrap raw reference text in quotes or triple backticks.",
      "Instruct: 'Do not extrapolate beyond the provided text'."
    ],
    commonMistakes: [
      "Referencing 'our past tickets' without providing the text.",
      "Allowing the model to speculate on missing information."
    ],
    difficulty: "intermediate",
    language: "english",
    status: "published",
    displayOrder: 1
  },
  {
    id: "ex-inp-02",
    component: "Input / Reference",
    title: "Dataset Sales Numbers (Tanglish)",
    explanation: "Strict boundary around provided numerical data in Tanglish.",
    weakPrompt: "Enoda sales numbers ah analyse pannu.",
    improvedPrompt: "Intha monthly sales data ah mattum use pannunga:\n[Jan: 120 units (Rs 60,000), Feb: 95 units (Rs 47,500), Mar: 210 units (Rs 1,05,000)].\nIntha data la irundhu mattum percentage growth calculate pannunga. Extra assumptions panna koodathu.",
    whyBetter: "Real numbers enclose pannirukku, and calculations purely intha input base panni thaan irukkanum nu restrict pannirukku.",
    tips: [
      "Numbers and currencies brackets la clear ah kudunga.",
      "Calculation boundaries specify pannunga."
    ],
    commonMistakes: [
      "Data illama 'analyze my sales' nu kekurathu.",
      "Imaginary numbers AI create panna allow panrathu."
    ],
    difficulty: "beginner",
    language: "tanglish",
    status: "published",
    displayOrder: 2
  },

  // 6. Output Format
  {
    id: "ex-out-01",
    component: "Output Format",
    title: "Structured Markdown Table Specifications",
    explanation: "Defines exact table headers and code block presentation.",
    weakPrompt: "Give me the result in a table.",
    improvedPrompt: "Format the output as a Markdown table with exactly 4 columns: | Step Number | Command | Purpose | Expected Output |. Below the table, provide a separate ```bash code block containing the complete execution sequence.",
    whyBetter: "Explicitly names all 4 table headers and specifies the secondary code block with language identifier.",
    tips: [
      "Provide literal column names in pipes: | Col 1 | Col 2 |.",
      "State whether a code block, JSON schema, or list is expected."
    ],
    commonMistakes: [
      "Asking for 'a nice table' without specifying what data goes in each column.",
      "Allowing explanatory chat before or after the requested format."
    ],
    difficulty: "beginner",
    language: "english",
    status: "published",
    displayOrder: 1
  },
  {
    id: "ex-out-02",
    component: "Output Format",
    title: "Comparison Grid Format (Tamil)",
    explanation: "விரிவான அட்டவணை நெடுவரிசை விவரக்குறிப்பு.",
    weakPrompt: "அட்டவணையாக தாருங்கள்.",
    improvedPrompt: "முடிவுகளை 4 நெடுவரிசைகள் கொண்ட மார்டவுன் அட்டவணையாக (Markdown Table) தரவும்:\n| எண் | AI கருவியின் பெயர் | முதன்மை பயன்பாடு | இலவச வரம்பு |\nஅட்டவணைக்கு கீழே 2 வரிகளில் முக்கிய முடிவுரையை மட்டும் சேர்க்கவும்.",
    whyBetter: "அட்டவணையின் நெடுவரிசைகள் மற்றும் அதற்கு கீழான முடிவுரையின் வரம்புகள் மிகத் தெளிவாக வரையறுக்கப்பட்டுள்ளன.",
    tips: [
      "அட்டவணை தலைப்புகளை தெளிவாக பட்டியலிடவும்.",
      "அட்டவணைக்கு பிறகான விளக்கங்களின் அளவை கட்டுப்படுத்தவும்."
    ],
    commonMistakes: [
      "எந்தெந்த விவரங்கள் அட்டவணையில் வர வேண்டும் என கூறாமல் விடுவது.",
      "அட்டவணைக்கு பதில் சாதாரண பட்டியல் வர அனுமதிப்பது."
    ],
    difficulty: "intermediate",
    language: "tamil",
    status: "published",
    displayOrder: 2
  },

  // 7. Style / Tone
  {
    id: "ex-sty-01",
    component: "Style / Tone",
    title: "Executive Technical Retrospective Tone",
    explanation: "Sets professional, objective, and blameless tone for leadership.",
    weakPrompt: "Be professional.",
    improvedPrompt: "Adopt an objective, empathetic, and blameless post-mortem tone. Write in concise active voice suitable for an engineering VP reviewing an incident retrospective. Avoid emotional exaggeration.",
    whyBetter: "Combines 3 specific tone descriptors ('objective', 'empathetic', 'blameless') and targets executive-level communication.",
    tips: [
      "Specify voice (active vs passive) and emotional posture.",
      "Name the recipient's seniority (e.g. VP level)."
    ],
    commonMistakes: [
      "Using generic words like 'good tone' or 'be polite'.",
      "Requesting conflicting tones like 'be hilarious yet extremely grave'."
    ],
    difficulty: "advanced",
    language: "english",
    status: "published",
    displayOrder: 1
  },
  {
    id: "ex-sty-02",
    component: "Style / Tone",
    title: "Friendly Mentor Tone (Tanglish)",
    explanation: "Conversational, supportive tone in Tanglish.",
    weakPrompt: "Friendly ah irukattum.",
    improvedPrompt: "Tone: Oru senior software engineer thoda junior ku guide panra maari supportive, conversational, and encouragement thara tone la irukanum. Over robotic words thavirthu, practical advice focus pannanum.",
    whyBetter: "Senior-to-junior mentor relationship and encouragement focus clear ah define aagiyirukku.",
    tips: [
      "Relationship context specify pannunga (e.g. mentor to student).",
      "Over-robotic jargon avoid panna sollunga."
    ],
    commonMistakes: [
      "Tone specify pannama generic AI voice vara vidurathu.",
      "Slang over ah use panni professional clarity miss panrathu."
    ],
    difficulty: "beginner",
    language: "tanglish",
    status: "published",
    displayOrder: 2
  },

  // 8. Validation / Success Criteria
  {
    id: "ex-val-01",
    component: "Validation / Success Criteria",
    title: "Pre-Flight Self-Verification Audit",
    explanation: "Provides the model with explicit self-auditing checklist before finalizing.",
    weakPrompt: "Make sure everything is right.",
    improvedPrompt: "Before generating the final answer, self-validate against these criteria:\n1. Does the code contain null/undefined safety checks?\n2. Are all 3 requirements from Section 3 addressed?\n3. Is the total word count between 180 and 220 words?\nIf any check fails, revise before printing.",
    whyBetter: "Forces the LLM's reasoning engine to evaluate its own draft against numbered, measurable quality gates before returning output.",
    tips: [
      "Include a revision command: 'If any check fails, revise before output'.",
      "Check both content completeness and length constraints."
    ],
    commonMistakes: [
      "Assuming the AI performs thorough self-auditing without an explicit directive.",
      "Writing qualitative checks that cannot be verified numerically."
    ],
    difficulty: "advanced",
    language: "english",
    status: "published",
    displayOrder: 1
  },
  {
    id: "ex-val-02",
    component: "Validation / Success Criteria",
    title: "Accuracy and Link Verification (Tanglish)",
    explanation: "Self-check verification gates in Tanglish.",
    weakPrompt: "Check pannitu kudu.",
    improvedPrompt: "Final answer submit panrathukku munnadi check pannunga:\n1. Mention panna ellam AI tool links um HTTPS format la irukka?\n2. Pricing tier (Free vs Paid) accurately distinguish aagiyirukka?\n3. Exactly 5 tools mattum thaan mention aagiyirukka nu verify pannunga.",
    whyBetter: "HTTPS links, pricing tier accuracy, and exact tool count (5) nu measurable criteria set pannirukku.",
    tips: [
      "Link formats and number counts check panna sollunga.",
      "Fact-checking steps enforce pannunga."
    ],
    commonMistakes: [
      "'Nalla check pannu' nu vague ah solrathu.",
      "Measurable validation points tharama vidurathu."
    ],
    difficulty: "intermediate",
    language: "tanglish",
    status: "published",
    displayOrder: 2
  }
];
