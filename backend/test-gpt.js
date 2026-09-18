require('dotenv').config();
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // baseURL: process.env.OPENAI_BASE_URL,  // uncomment if you have one
});

(async () => {
  console.log('Key starts:', process.env.OPENAI_API_KEY?.slice(0, 15));
  console.log('Key ends:  ', process.env.OPENAI_API_KEY?.slice(-6));
  console.log('Key length:', process.env.OPENAI_API_KEY?.length);
  console.log('Base URL:', process.env.OPENAI_BASE_URL || '(default OpenAI)');

  try {
    const r = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'hi' }],
    });
    console.log('✅ Works:', r.choices[0].message.content);
  } catch (e) {
    console.error('❌ Status:', e.status);
    console.error('❌ Error :', e.message);
  }
})();