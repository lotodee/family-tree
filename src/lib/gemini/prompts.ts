export const PROMPT_TEMPLATES = {
  funny_intro: (name: string) => `Introduce ${name} in a funny way`,
  what_if: (name: string, scenario: string) => `What if ${name} ${scenario}`,
  family_image: (name: string) => `Generate an image of ${name}`,
  compare: (name1: string, name2: string) => `Compare ${name1} and ${name2}`,
  grandpa_legacy: () => `Tell us about Grandpa Michael's legacy`,
};
