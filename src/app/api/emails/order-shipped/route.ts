import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(text: string | number): string {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, customerName, customerEmail, deliveryCity, trackingNumber, items, subtotal } = await req.json();

    if (!customerEmail || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shortId = orderId.slice(0, 8).toUpperCase();

    const itemsHtml = items && items.length > 0 ? (items as OrderItem[]).map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333;">
          ${esc(item.name)}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #666; text-align: center;">
          ${esc(item.quantity)}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #666; text-align: right; white-space: nowrap;">
          ${(item.price).toLocaleString('de-DE')} ден
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; font-weight: 500; color: #333; text-align: right; white-space: nowrap;">
          ${(item.price * item.quantity).toLocaleString('de-DE')} ден
        </td>
      </tr>
    `).join('') : '';

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background-color: #1e3a5f; color: white; padding: 10px 20px; border-radius: 12px; font-weight: 900; font-size: 16px; letter-spacing: -0.5px;">
            ИНТЕР СТАР <span style="color: #dc2626;">ЏАМБО</span>
          </div>
        </div>

        <!-- Card -->
        <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          
          <!-- Truck Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 56px; height: 56px; background-color: #f3e8ff; border-radius: 50%; line-height: 56px; font-size: 28px;">
              🚚
            </div>
          </div>

          <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #111; text-align: center;">
            Вашата нарачка е испратена!
          </h1>
          <p style="margin: 0 0 24px; font-size: 14px; color: #666; text-align: center; line-height: 1.5;">
            Здраво ${esc(customerName)}, сакаме да ве известиме дека вашата нарачка <strong>#${shortId}</strong> е предадена на курирска служба и е на пат кон вас.
          </p>

          <!-- Delivery Info -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-size: 13px; color: #888; padding: 6px 0; font-weight: 600;">Нарачка</td>
                <td style="font-size: 14px; color: #333; padding: 6px 0; text-align: right; font-weight: 600;">#${shortId}</td>
              </tr>
              <tr>
                <td style="font-size: 13px; color: #888; padding: 6px 0; font-weight: 600;">Град</td>
                <td style="font-size: 14px; color: #333; padding: 6px 0; text-align: right;">${esc(deliveryCity || 'Македонија')}</td>
              </tr>
              <tr>
                <td style="font-size: 13px; color: #888; padding: 6px 0; font-weight: 600;">Плаќање</td>
                <td style="font-size: 14px; color: #333; padding: 6px 0; text-align: right;">При достава (COD)</td>
              </tr>
              ${trackingNumber ? `<tr>
                <td style="font-size: 13px; color: #888; padding: 6px 0; font-weight: 600;">Број за следење</td>
                <td style="font-size: 14px; color: #333; padding: 6px 0; text-align: right; font-weight: 600;">${esc(trackingNumber)}</td>
              </tr>` : ''}
            </table>
          </div>

          ${itemsHtml ? `
          <!-- Order Details -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px;">
              Артикли во пратката
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
              <thead>
                <tr>
                  <th style="padding: 0 0 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-align: left; text-transform: uppercase;">Артикл</th>
                  <th style="padding: 0 0 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-align: center; text-transform: uppercase;">Кол.</th>
                  <th style="padding: 0 0 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-align: right; text-transform: uppercase;">Цена/ком</th>
                  <th style="padding: 0 0 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-align: right; text-transform: uppercase;">Вкупно</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-size: 14px; color: #666; padding: 4px 0;">Меѓузбир</td>
                <td style="font-size: 14px; font-weight: 500; color: #333; text-align: right;">${Number(subtotal).toLocaleString('de-DE')} ден</td>
              </tr>
              <tr>
                <td style="font-size: 14px; color: #666; padding: 4px 0;">Испорака</td>
                <td style="font-size: 13px; color: #999; text-align: right; font-style: italic;">Укажано на товарниот лист</td>
              </tr>
              <tr>
                <td style="font-size: 15px; font-weight: 700; color: #111; padding: 12px 0 4px 0; border-top: 1px solid #e5e7eb; margin-top: 8px;">Вкупно</td>
                <td style="font-size: 16px; font-weight: 800; color: #1e40af; text-align: right; padding: 12px 0 4px 0; border-top: 1px solid #e5e7eb; margin-top: 8px;">${Number(subtotal).toLocaleString('de-DE')} ден</td>
              </tr>
            </table>
          </div>
          ` : ''}

          <!-- Note -->
          <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 16px;">
            <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
              📦 Очекувајте пратката во рок од <strong>1-3 работни дена</strong>. Курирот ќе ве контактира пред достава.
            </p>
          </div>

          <p style="margin: 24px 0 0; font-size: 13px; color: #888; text-align: center; line-height: 1.5;">
            За дополнителни прашања, контактирајте не на <strong>+389 31 422 656</strong>.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #999; line-height: 1.6;">
          <p style="margin: 0;">ИНТЕР СТАР ЏАМБО</p>
          <p style="margin: 4px 0;">Народна Револуција 43, Куманово</p>
          <p style="margin: 4px 0;">📞 +389 31 422 656</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const { error } = await resend.emails.send({
      from: 'Интер Стар Џамбо <naracki@interstarjumbo.com>',
      to: customerEmail,
      subject: `Нарачка #${shortId} — Испратена! | Интер Стар Џамбо`,
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
