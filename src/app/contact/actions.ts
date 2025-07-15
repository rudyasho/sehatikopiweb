// src/app/contact/actions.ts
'use server';
import 'dotenv/config';
import { z } from 'zod';
import { Resend } from 'resend';

const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10),
  apiKey: z.string().startsWith('re_'),
});

export async function sendContactMessage(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = contactFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
    return {
      error: 'Invalid data. Please check your inputs.',
    };
  }
  
  const { name, email, subject, message, apiKey } = validatedFields.data;
  const resend = new Resend(apiKey);
  const destinationEmail = 'sehaticoffee.id@gmail.com';

  try {
    const { data, error } = await resend.emails.send({
      from: 'Sehati Kopi Contact Form <onboarding@resend.dev>', // This must be a verified domain in Resend
      to: [destinationEmail],
      reply_to: email,
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <p>You have received a new message from the Sehati Kopi contact form.</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { error: 'Failed to send message. Please try again later.' };
    }

    return { success: 'Message sent successfully!' };
  } catch (error) {
    console.error('Server Action Error:', error);
    return { error: 'An unexpected error occurred.' };
  }
}
