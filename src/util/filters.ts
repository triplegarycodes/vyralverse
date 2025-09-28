// Step 12 & 30: Simple moderation filters to sanitize user content
const blacklist = ['spam', 'scam', 'toxic'];
const whitelist = ['vyral', 'neon', 'flow', 'momentum'];

export const sanitizeMessage = (input: string): string => {
  let output = input;
  for (const word of blacklist) {
    const pattern = new RegExp(word, 'gi');
    output = output.replace(pattern, '⚠️');
  }
  return output;
};

export const isMessageAllowed = (input: string): boolean => {
  const lower = input.toLowerCase();
  return whitelist.some(word => lower.includes(word)) || !blacklist.some(word => lower.includes(word));
};
