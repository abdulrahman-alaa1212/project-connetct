import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-assessment.ts';
import '@/ai/flows/match-vr-ar-solutions.ts';
import '@/ai/flows/recommend-jobs.ts';