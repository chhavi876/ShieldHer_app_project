'use server';
/**
 * @fileOverview A flow for sending alerts to emergency contacts.
 *
 * - sendAlertToContacts - A function that handles sending alerts.
 * - SendAlertToContactsInput - The input type for the sendAlertToContacts function.
 * - SendAlertToContactsOutput - The return type for the sendAlertToContacts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendAlertToContactsInputSchema = z.object({
  sensorData: z.object({
    acousticSignature: z.string().describe('The acoustic signature detected.'),
    motionPattern: z.string().describe('The motion pattern detected.'),
    locationContext: z.string().describe('The location context of the incident.'),
    trustedDevicesPresent: z.boolean().describe('Whether trusted devices are present.'),
    safeZoneStatus: z.string().describe('The status of the location relative to safe zones.'),
  }),
  evidence: z.object({
    video: z.string().describe("A data URI of a short video clip of the incident. Must be a data URI with a MIME type and Base64 encoding, e.g., 'data:<mimetype>;base64,<encoded_data>'."),
    audio: z.string().describe("A data URI of a short audio clip of the incident. This is for reference and not sent to the model. Must be a data URI with a MIME type and Base64 encoding, e.g., 'data:<mimetype>;base64,<encoded_data>'."),
  }),
  emergencyContacts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    avatar: z.string(),
  })).describe('An array of emergency contacts to notify.'),
});
export type SendAlertToContactsInput = z.infer<typeof SendAlertToContactsInputSchema>;

const SendAlertToContactsOutputSchema = z.object({
  message: z.string().describe('The detailed alert message sent to emergency contacts.'),
  sentTo: z.array(z.string()).describe('A list of contact names to whom the alert was sent.'),
});
export type SendAlertToContactsOutput = z.infer<typeof SendAlertToContactsOutputSchema>;

export async function sendAlertToContacts(input: SendAlertToContactsInput): Promise<SendAlertToContactsOutput> {
  return sendAlertToContactsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sendAlertToContactsPrompt',
  input: { schema: SendAlertToContactsInputSchema },
  output: { schema: SendAlertToContactsOutputSchema },
  prompt: `You are an AI assistant for Guardian Angel, a personal safety app. Your task is to generate a detailed emergency alert message based on an incident.

The message should be clear, and provide actionable information. Start with a clear warning like "Guardian Angel Alert for [User's Name]". Since we don't have the user's name, use "your loved one".

Incorporate the following data:
- Acoustic Signature: {{{sensorData.acousticSignature}}}
- Motion Pattern: {{{sensorData.motionPattern}}}
- Location: {{{sensorData.locationContext}}}
- Safe Zone: {{{sensorData.safeZoneStatus}}}
- Trusted Devices Nearby: {{#if sensorData.trustedDevicesPresent}}Yes{{else}}No{{/if}}

Based on the video, briefly describe what is happening.
Video: {{media url=evidence.video}}

Finally, create a JSON object with two keys:
1.  "message": The full alert text.
2.  "sentTo": An array of names of all emergency contacts.

Contacts:
{{#each emergencyContacts}}
- {{name}} ({{phone}})
{{/each}}
`,
});

const sendAlertToContactsFlow = ai.defineFlow(
  {
    name: 'sendAlertToContactsFlow',
    inputSchema: SendAlertToContactsInputSchema,
    outputSchema: SendAlertToContactsOutputSchema,
  },
  async (input) => {
    // In a real app, this is where you'd integrate with an SMS service like Twilio
    // to send the generated `message` to each contact's phone number.
    // For this prototype, we'll just generate the message and log it.

    const { output } = await prompt(input);
    const alertResult = output!;

    console.log('--- SIMULATING SENDING ALERTS ---');
    alertResult.sentTo.forEach((name) => {
      const contact = input.emergencyContacts.find(c => c.name === name);
      console.log(`To: ${name} (${contact?.phone})`);
    });
    console.log('Message:', alertResult.message);
    console.log('---------------------------------');

    return alertResult;
  }
);
