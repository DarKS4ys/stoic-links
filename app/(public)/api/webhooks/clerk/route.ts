import { db } from '@/lib/prisma';
import { IncomingHttpHeaders } from 'http';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook, WebhookRequiredHeaders } from 'svix';

const webhookSecret = process.env.WEBHOOK_SECRET || '';

async function handler(request: Request) {
  const payload = await request.json();
  const headersList = headers();
  const heads = {
    'svix-id': headersList.get('svix-id'),
    'svix-timestamp': headersList.get('svix-timestamp'),
    'svix-signature': headersList.get('svix-signature'),
  };
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;

  try {
    evt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders
    ) as Event;
  } catch (err) {
    console.log('error with clerk sync');
    console.error((err as Error).message);
    return NextResponse.json({}, { status: 400 });
  }

  const eventType: EventType = evt.type;
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, ...attributes } = evt.data;

/*     console.log(id);
    console.log(attributes); */

    const first_name = attributes.first_name || '';
    const last_name = attributes.last_name || '';
    const username = attributes.username || undefined;
    const image_url = attributes.image_url || '';
    const email = attributes.email_addresses[0].email_address || '';
    const onboarding = attributes.private_metadata.onboarding || 1
    const description = attributes.private_metadata.description || ''
    const banner = attributes.private_metadata.banner || ''

    /*console.log(first_name);
    console.log(last_name);
    console.log(username);
    console.log(image_url);
    console.log(email);
    console.log(onboarding)
    console.log(description)
    */

    await db.user.upsert({
      where: { externalId: id },
      create: {
        email: email,
        externalId: id,
        first_name: first_name,
        last_name: last_name,
        image: image_url,
        onboarding: onboarding,
        description: description
      },
      update: {
        email: email,
        externalId: id,
        first_name: first_name,
        last_name: last_name,
        username: username,
        image: image_url,
        onboarding: onboarding,
        description: description,
        banner: banner
      },
    });

    return new Response('Succsessfully synced user with database.');
  }
}

type EventType = 'user.created' | 'user.updated' | '*';

type Event = {
  data: Record<string, string | number | any>;
  object: 'event';
  type: EventType;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;