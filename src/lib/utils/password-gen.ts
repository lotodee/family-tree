const WORDS = [
  "mango", "river", "cloud", "happy", "purple", "ocean", "tiger",
  "honey", "coral", "blaze", "frost", "olive", "cedar", "amber",
  "pearl", "lunar", "maple", "storm", "bloom", "crest", "delta",
  "ember", "flora", "grain", "hazel", "ivory", "jewel", "lemon",
  "marsh", "noble", "oasis", "plume", "quilt", "ridge", "spice",
  "trail", "ultra", "vivid", "wheat", "zephyr", "brave", "charm",
  "dream", "eagle", "flame", "globe", "haven", "inlet", "knoll",
  "lotus", "melon", "night", "orbit", "prism", "queen", "rowan",
  "shade", "thorn", "unity", "valor", "willow", "yield", "zippy",
  "azure", "berry", "crane", "dusk", "fable", "grove", "heron",
  "jade", "kite", "lark", "moss", "nest", "palm", "reef",
  "silk", "tide", "vine", "wave", "wren", "aspen", "birch",
  "clove", "dove", "fern", "glow", "haze", "iris", "sage",
  "star", "teal", "dune", "echo", "fawn", "isle", "peak",
];

function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function getRandomDigits(count: number): string {
  let digits = "";
  for (let i = 0; i < count; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return digits;
}

/**
 * Generates a memorable password in the format: word-word-123
 * Easy to remember, easy to type on a phone, easy to read aloud.
 */
export function generatePassword(): string {
  const word1 = getRandomWord();
  let word2 = getRandomWord();
  while (word2 === word1) {
    word2 = getRandomWord();
  }
  const digits = getRandomDigits(3);
  return `${word1}-${word2}-${digits}`;
}
