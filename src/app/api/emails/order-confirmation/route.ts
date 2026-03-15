import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { OrderItem } from '@/lib/types';
import { esc, renderItemsHtml, renderOrderSummaryHtml, EMAIL_HEADER, EMAIL_FOOTER } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { orderId, customerName, customerEmail, items, subtotal, deliveryAddress, deliveryCity } = await req.json();

    if (!customerEmail || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the order exists in the database before sending email
    const supabase = createClient();
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single();

    if (dbError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 403 });
    }

    const shortId = orderId.slice(0, 8).toUpperCase();
    const itemsHtml = renderItemsHtml(items as OrderItem[]);

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        ${EMAIL_HEADER}
        <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 56px; height: 56px; background-color: #dcfce7; border-radius: 50%; line-height: 56px; font-size: 28px;">
              ✓
            </div>
          </div>
          <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #111; text-align: center;">
            Нарачката е примена!
          </h1>
          <p style="margin: 0 0 24px; font-size: 14px; color: #666; text-align: center;">
            Ви благодариме, ${esc(customerName)}. Вашата нарачка #${shortId} е успешно регистрирана.
          </p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px;">
              Нарачани артикли
            </h3>
            ${renderOrderSummaryHtml(itemsHtml, subtotal)}
          </div>
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px;">
              Адреса за испорака
            </h3>
            <p style="margin: 0; font-size: 14px; color: #333;">
              ${esc(deliveryAddress)}<br>
              ${esc(deliveryCity)}
            </p>
          </div>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 600;">
              💰 Плаќање при достава (COD)
            </p>
          </div>
          <p style="margin: 24px 0 0; font-size: 13px; color: #888; text-align: center; line-height: 1.5;">
            Ќе ве контактираме наскоро за потврда на нарачката и детали за испораката.
          </p>
        </div>
        ${EMAIL_FOOTER}
      </div>
    </body>
    </html>
    `;

    const { error } = await resend.emails.send({
      from: 'Интер Стар Џамбо <naracki@interstarjumbo.com>',
      to: customerEmail,
      subject: `Нарачка #${shortId} — Потврда | Интер Стар Џамбо`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
