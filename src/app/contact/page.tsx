// src/app/contact/page.tsx
import { getSettings } from '@/lib/settings-data';
import { ContactClientPage } from './contact-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with Sehati Kopi. Visit our store, send us a message, or find us on social media. We love to hear from you!',
};

const ContactPage = async () => {
    const settings = await getSettings();

    return <ContactClientPage settings={settings} />;
};

export default ContactPage;
