const axios = require('axios');
const env = require('../config/env');

const CHAT_URL = env.ENHANCE_API_URL;
const CHAT_KEY = env.ENHANCE_API_KEY || '';
const CHAT_MODEL = env.ENHANCE_MODEL || 'Qwen/Qwen3-8B';

const SYSTEM_PROMPT = `You are a prompt enhancer for the Z-Image-Turbo image generation model. You receive a rough prompt and output an enhanced version. Nothing else — no explanation, no options, just the enhanced prompt.

RULES FOR Z-IMAGE-TURBO:
- Natural language sentences, NOT comma-separated tags
- guidance_scale is 0.0 so negative prompts don't work — say what you WANT, never what you don't want
- Quality boosters like "masterpiece, best quality" are useless — skip them
- Prompt weight syntax like (word:1.5) does NOT work — use "with emphasis on" or "focusing on" instead
- Optimal length: 80-200 words. Shorter is fine, over 300 degrades quality
- Earlier words get more attention from the model — put the most important thing FIRST
- Max 3-5 key visual concepts per prompt — overloading causes elements to disappear

STRUCTURE (follow this order):
1. SUBJECT + ACTION — who/what is doing what (most important, goes first)
2. KEY OBJECTS — 4-6 specific things around the subject
3. STYLE — art style, shadows, shapes (e.g. "flat vector illustration with soft shadows and rounded shapes")
4. COLORS — name 4-5 specific colors (e.g. "coral orange, sky blue, golden yellow, teal green")
5. BACKGROUND — state it explicitly (e.g. "plain solid white background")
6. NO-TEXT CLAUSE — always append: "Contains absolutely zero text, zero words, zero letters, zero numbers anywhere in the image."

WHAT TO FIX IN THE INPUT:
- Replace abstract concepts with concrete objects ("innovation" → "glowing lightbulb surrounded by gears")
- Replace vague adjectives with specific ones ("beautiful" → "crystalline", "nice" → "sun-bleached")
- Add a character/person if missing — scenes with people are more engaging
- Add pose/action if the person is just standing — make them interact with objects
- If the input mentions screens/charts/signs, explicitly say "showing only abstract colored bars and shapes, no labels"
- Remove any contradictory styles ("photorealistic cartoon")

OUTPUT: Just the enhanced prompt. One paragraph. Nothing else.`;

const FEW_SHOT_USER = 'a cat sitting on a windowsill';
const FEW_SHOT_ASSISTANT = 'A fluffy orange tabby cat with bright green eyes sits curled on a sun-drenched wooden windowsill, one paw dangling lazily over the edge. A small terracotta pot of lavender and a half-open leather-bound book rest beside the cat. Soft impressionist style with warm diffused light casting long golden shadows across the scene. Rich amber, creamy ivory, muted sage green, dusty lavender, and warm chestnut tones dominate the palette. Beyond the window a quiet cobblestone street lined with pastel townhouses fades into a hazy afternoon sky. Contains absolutely zero text, zero words, zero letters, zero numbers anywhere in the image.';

function looksLikeGarbage(text) {
  const garbagePatterns = [
    /\bcurl\s+-/i,
    /\bwget\s+/i,
    /-H\s+["']Content-Type/i,
    /-H\s+["']Authorization/i,
    /"model"\s*:\s*"/,
    /"messages"\s*:\s*\[/,
    /"role"\s*:\s*"/,
    /```[\s\S]*```/,
    /\{\s*"[^"]+"\s*:/,
    /\bv1\/chat\/completions\b/,
    /\bv1\/images\/generations\b/,
    /\bBearer\s+[A-Za-z0-9_-]{10,}/,
    /^(GET|POST|PUT|DELETE|PATCH)\s+https?:\/\//im,
    /import\s+\{.*\}\s+from\s+/,
    /require\s*\(\s*['"]/,
    /\bfunction\s+\w+\s*\(/,
    /\bconst\s+\w+\s*=/,
    /\bAnalyze the Request\b/i,
    /\*\s*Input\s*:/i,
    /\*\s*Task\s*:/i,
    /\*\s*Output Format\s*:/i,
    /\*\s*Rules\s*:/i,
    /\*\s*Constraints\s*:/i,
    /\bStep \d+\s*:/i,
    /\bRULES\s*:/i,
    /\bSTRUCTURE\s*:/i,
    /\bSubject\s*\+\s*Action\b/i,
  ];
  return garbagePatterns.some((p) => p.test(text));
}

function sanitizeEnhancedPrompt(raw, fallback) {
  if (!raw || typeof raw !== 'string') return fallback;

  let text = raw.trim();

  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  text = text.replace(/```[\s\S]*?```/g, '').trim();
  text = text.replace(/#{1,6}\s+/g, '');
  text = text.replace(/\*\*([^*]*)\*\*/g, '$1');
  text = text.replace(/__([^_]*)__/g, '$1');
  text = text.replace(/^\s*(enhanced prompt|final prompt|prompt|refined prompt|output|result|here is|here's)[^a-z]*:?\s*/i, '').trim();

  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    const metaPattern = /^(thinking|analysis|analyze|steps?|reasoning|refining|check|notes?|rules?|structure|what to fix|constraints|input|task|output format)\b/i;
    const nonMeta = paragraphs.filter((p) => !metaPattern.test(p));
    if (nonMeta.length > 0) {
      text = nonMeta.reduce((a, b) => (a.length >= b.length ? a : b));
    }
  }

  text = text
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (/^["']/.test(text) && /["']$/.test(text)) {
    text = text.slice(1, -1).trim();
  }

  if (!text || looksLikeGarbage(text)) {
    console.warn('[promptEnhancer] Response rejected by sanitizer');
    return fallback;
  }

  if (text.split(/\s+/).length < 15) {
    console.warn('[promptEnhancer] Response too short, rejecting');
    return fallback;
  }

  return text;
}

async function callLLM(prompt, temperature) {
  const response = await axios.post(
    CHAT_URL,
    {
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: FEW_SHOT_USER },
        { role: 'assistant', content: FEW_SHOT_ASSISTANT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 512,
      temperature,
      enable_thinking: false,
    },
    {
      headers: {
        Authorization: `Bearer ${CHAT_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    },
  );

  const choice = response.data?.choices?.[0];
  const content = (choice?.message?.content || '').trim();
  const reasoning = (choice?.message?.reasoning_content || '').trim();
  if (reasoning) {
    console.log('[promptEnhancer] Model included reasoning_content (ignored)');
  }
  return content;
}

const MAX_RETRIES = 2;

async function enhancePrompt(rawPrompt) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const temperature = 0.7 + attempt * 0.15;
      const raw = await callLLM(rawPrompt, temperature);

      if (!raw) {
        console.warn(`[promptEnhancer] Attempt ${attempt + 1}: empty response`);
        continue;
      }

      console.log(`[promptEnhancer] Attempt ${attempt + 1} raw response (first 200 chars):`, raw.slice(0, 200));

      const enhanced = sanitizeEnhancedPrompt(raw, null);
      if (enhanced) return enhanced;

      console.warn(`[promptEnhancer] Attempt ${attempt + 1}: response rejected by sanitizer`);
    } catch (err) {
      console.error(`[promptEnhancer] Attempt ${attempt + 1} failed:`, err.message);
    }
  }

  console.warn('[promptEnhancer] All attempts failed, falling back to original prompt');
  return rawPrompt;
}

module.exports = { enhancePrompt };
