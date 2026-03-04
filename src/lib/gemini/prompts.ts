export const SYSTEM_INSTRUCTION = `You are the AI host at Michael Ademiluyi's 100th birthday celebration.

You are speaking to a room full of family — grandchildren, children, spouses, and Grandpa Michael himself. Your audience is a multi-generational Nigerian Yoruba family gathered in celebration.

RULES:
1. ONLY use information from the family data provided in the context. Never make up stories, traits, or quotes.
2. Be warm, funny, and celebratory. This is a party, not a lecture.
3. Reference specific answers and stories the family shared — this is what makes it personal.
4. If you don't have enough data about someone, say so warmly: "The family hasn't shared much about [name] yet — who wants to tell us something?"
5. Speak as if you're addressing the room. Use "we", "our family", "let's hear it for..."
6. Be respectful about deceased family members.
7. Keep responses to 2-4 paragraphs unless asked for more. This is live entertainment — don't monologue.
8. Use humor that would land in a Nigerian family setting. Light teasing is welcome. Meanness is not.
9. When quoting family members, name them: "As Yinka put it, '...'" — this creates moments of recognition in the audience.
10. End with energy — a toast, a cheer, a call to the room.`;

export interface PromptTemplate {
  key: string;
  label: string;
  icon: string;
  description: string;
  subjectCount: "one" | "two" | "none" | "any";
  scenarioInput?: boolean;
  buildPrompt: (names: string[], scenario?: string) => string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    key: "funny_intro",
    label: "Funny Intro",
    icon: "laugh",
    description: "Introduce someone in the most hilarious way",
    subjectCount: "one",
    buildPrompt: ([name]) =>
      `Introduce ${name} to the room in the most hilarious way possible. Use what the family said about them. Exaggerate their personality traits. Make it feel like a comedy roast at a family gathering — loving but very funny. End with something the whole room can cheer to.`,
  },
  {
    key: "what_if",
    label: "What If...",
    icon: "question",
    description: "Imagine a fun scenario about someone",
    subjectCount: "one",
    scenarioInput: true,
    buildPrompt: ([name], scenario) =>
      `Based on everything the family has said about ${name}, imagine this scenario: ${scenario || "they became President of Nigeria for a day"}. Paint a vivid, funny picture using their real personality traits, quirks, and habits the family described.`,
  },
  {
    key: "compare",
    label: "Compare Two",
    icon: "scale",
    description: "Compare two family members side by side",
    subjectCount: "two",
    buildPrompt: ([name1, name2]) =>
      `Compare ${name1} and ${name2} based on what the family has said about them. What do they have in common? How are they hilariously different? Make it entertaining, affectionate, and something both of them would laugh at.`,
  },
  {
    key: "superlatives",
    label: "Family Superlative",
    icon: "trophy",
    description: "Who's the most likely to... in the family",
    subjectCount: "none",
    scenarioInput: true,
    buildPrompt: (_, scenario) =>
      `Based on all the family stories collected, who in the Ademiluyi family is most likely to: ${scenario || "start a business, be late to every event, cook the best jollof rice"}? Use actual quotes and personality descriptions to justify your picks. Make it fun — the family should be pointing at each other and laughing.`,
  },
  {
    key: "legacy",
    label: "Grandpa's Legacy",
    icon: "crown",
    description: "How Grandpa shaped this family",
    subjectCount: "none",
    buildPrompt: () =>
      `Based on everything the family has shared — their memories of Grandpa Michael, how he shaped their lives, what he taught them — paint a picture of his legacy. How has this one man, now 100 years old, shaped three generations? Use the family's own words. Make it moving. This is the heart of the celebration.`,
  },
  {
    key: "toast",
    label: "Write a Toast",
    icon: "toast",
    description: "Generate a personalized toast",
    subjectCount: "one",
    buildPrompt: ([name]) =>
      `Write a heartfelt toast to ${name} that the host can read to the room. Use specific things the family said about them — their qualities, their funny moments, what they mean to people. Keep it under 200 words. End with something everyone can raise their glasses to.`,
  },
  {
    key: "nickname",
    label: "Family Nickname",
    icon: "tag",
    description: "Generate a funny family nickname",
    subjectCount: "one",
    buildPrompt: ([name]) =>
      `Based on what the family said about ${name}, come up with 3 funny, affectionate family nicknames for them and explain why each one fits. Use their real personality traits and stories. Make the room laugh.`,
  },
  {
    key: "free",
    label: "Ask Anything",
    icon: "sparkle",
    description: "Type your own custom prompt",
    subjectCount: "any",
    buildPrompt: () => "", // Host writes their own prompt
  },
];

/**
 * Get a template by key
 */
export function getTemplateByKey(key: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find((t) => t.key === key);
}
