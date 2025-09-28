// Step 13: AI helper to build lesson outlines leveraging OpenAI when configured
import Constants from 'expo-constants';

export type LessonOutline = {
  topic: string;
  bullets: string[];
};

export const buildLessonOutline = async (topic: string): Promise<LessonOutline> => {
  const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra) as
    | { public?: { openAiApiKey?: string }; OPENAI_API_KEY?: string }
    | undefined;
  const apiKey =
    extra?.public?.openAiApiKey ?? extra?.OPENAI_API_KEY ?? process.env?.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    // Offline fallback blueprint keeps onboarding smooth during development
    return {
      topic,
      bullets: [
        `Define ${topic} in your own neon terms`,
        'Map two tangible micro-actions',
        'Lock a momentum ritual for tonight'
      ]
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You craft actionable neon productivity lessons. Keep responses short, 3 bullet outline.'
          },
          { role: 'user', content: `Build a quick actionable lesson outline about ${topic}.` }
        ],
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error('Failed to contact OpenAI');
    }

    const payload = await response.json();
    const text: string = payload.choices?.[0]?.message?.content ?? '';
    const bullets = text
      .split('\n')
      .map(line => line.replace(/^[-*\d\.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
    return { topic, bullets: bullets.length ? bullets : [`Momentum insight on ${topic}`] };
  } catch (error) {
    return {
      topic,
      bullets: [
        `Rapid reframing: ${topic}`,
        'Pinpoint one friction source',
        'Experiment with a neon micro-shift'
      ]
    };
  }
};
