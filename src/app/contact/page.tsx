// src/app/contact/page.tsx
import { getSettings } from '@/lib/settings-data';
import { ContactClientPage } from './contact-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kontak Kami - Sehati Kopi',
    description: 'Hubungi Sehati Kopi. Kunjungi kedai kami, kirim pesan, atau temukan kami di media sosial. Kami senang mendengar dari Anda!',
};

const ContactPage = async () => {
    const settings = await getSettings();

    return <ContactClientPage settings={settings} />;
};

export default ContactPage;
