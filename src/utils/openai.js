// OpenAI API utilities for AI-powered email editing
let openAIApiKey = localStorage.getItem('openai_api_key') || '';

export const setOpenAIKey = (key) => {
  openAIApiKey = key;
  localStorage.setItem('openai_api_key', key);
};

export const hasOpenAIKey = () => {
  return !!openAIApiKey || !!localStorage.getItem('openai_api_key');
};

export const callOpenAI = async ({ prompt, system = 'You are a helpful assistant.', signal } = {}) => {
  const key = openAIApiKey || localStorage.getItem('openai_api_key');
  if (!key) {
    throw new Error('OpenAI API key not set');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};
