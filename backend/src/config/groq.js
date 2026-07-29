import Groq from 'groq-sdk';
import { env } from './env.js';

export const groq = env.GROQ_API_KEY && !env.GROQ_API_KEY.startsWith('mock')
  ? new Groq({ apiKey: env.GROQ_API_KEY })
  : null;
