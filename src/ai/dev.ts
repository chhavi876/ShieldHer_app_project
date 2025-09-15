import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-incident-for-contacts.ts';
import '@/ai/flows/send-alert-to-contacts.ts';
