'use server';
/**
 * @fileOverview Summarizes the incident for emergency contacts.
 *
 * - summarizeIncidentForContacts - A function that generates a summary of the incident for emergency contacts.
 * - SummarizeIncidentForContactsInput - The input type for the summarizeIncidentForContacts function.
 * - SummarizeIncidentForContactsOutput - The return type for the summarizeIncidentForContacts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIncidentForContactsInputSchema = z.object({
  acousticSignature: z.string().describe('The acoustic signature detected.'),
  motionPattern: z.string().describe('The motion pattern detected.'),
  locationContext: z.string().describe('The location context of the incident.'),
  trustedDevicesPresent: z.boolean().describe('Whether trusted devices are present.'),
  safeZoneStatus: z.string().describe('The status of the location relative to safe zones.'),
});
export type SummarizeIncidentForContactsInput = z.infer<typeof SummarizeIncidentForContactsInputSchema>;

const SummarizeIncidentForContactsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the incident for emergency contacts.'),
});
export type SummarizeIncidentForContactsOutput = z.infer<typeof SummarizeIncidentForContactsOutputSchema>;

export async function summarizeIncidentForContacts(input: SummarizeIncidentForContactsInput): Promise<SummarizeIncidentForContactsOutput> {
  return summarizeIncidentForContactsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIncidentForContactsPrompt',
  input: {schema: SummarizeIncidentForContactsInputSchema},
  output: {schema: SummarizeIncidentForContactsOutputSchema},
  prompt: `You are an AI assistant that summarizes incident details for emergency contacts.

  Given the following information about a potential incident, create a concise summary (under 50 words) that would be helpful for someone receiving an emergency alert.

  Acoustic Signature: {{{acousticSignature}}}
  Motion Pattern: {{{motionPattern}}}
  Location Context: {{{locationContext}}}
  Trusted Devices Present: {{#if trustedDevicesPresent}}Yes{{else}}No{{/if}}
  Safe Zone Status: {{{safeZoneStatus}}}

  Summary:`,
});

const summarizeIncidentForContactsFlow = ai.defineFlow(
  {
    name: 'summarizeIncidentForContactsFlow',
    inputSchema: SummarizeIncidentForContactsInputSchema,
    outputSchema: SummarizeIncidentForContactsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
