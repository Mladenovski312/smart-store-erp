import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, customerName, customerEmail, items, subtotal, deliveryAddress, deliveryCity } = await req.json();

    if (!customerEmail || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shortId = orderId.slice(0, 8).toUpperCase();

    const itemsHtml = (items as OrderItem[]).map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333;">
          ${item.name}
          <span style="color: #888; font-size: 12px;"> × ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333; text-align: right; white-space: nowrap;">
          ${(item.price * item.quantity).toLocaleString()} ден
        </td>
      </tr>
    `).join('');

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
          
          <!-- Success Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 56px; height: 56px; background-color: #dcfce7; border-radius: 50%; line-height: 56px; font-size: 28px;">
              ✓
            </div>
          </div>

          <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #111; text-align: center;">
            Нарачката е примена!
          </h1>
          <p style="margin: 0 0 24px; font-size: 14px; color: #666; text-align: center;">
            Ви благодариме, ${customerName}. Вашата нарачка #${shortId} е успешно регистрирана.
          </p>

          <!-- Order Details -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px;">
              Нарачани артикли
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
            </table>
            <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
              <tr>
                <td style="font-size: 14px; color: #666; padding: 4px 0;">Меѓузбир</td>
                <td style="font-size: 14px; font-weight: 600; color: #333; text-align: right;">${Number(subtotal).toLocaleString()} ден</td>
              </tr>
              <tr>
                <td style="font-size: 14px; color: #666; padding: 4px 0;">Испорака</td>
                <td style="font-size: 13px; color: #999; text-align: right; font-style: italic;">По договор</td>
              </tr>
            </table>
          </div>

          <!-- Delivery -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px;">
              Адреса за испорака
            </h3>
            <p style="margin: 0; font-size: 14px; color: #333;">
              ${deliveryAddress}<br>
              ${deliveryCity}
            </p>
          </div>

          <!-- Payment -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 600;">
              💰 Плаќање при достава (COD)
            </p>
          </div>

          <p style="margin: 24px 0 0; font-size: 13px; color: #888; text-align: center; line-height: 1.5;">
            Ќе ве контактираме наскоро за потврда на нарачката и детали за испораката.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #999; line-height: 1.6;">
          <p style="margin: 0;">ИНТЕР СТАР ЏАМБО</p>
          <p style="margin: 4px 0;">ул. Борис Кидрич бр. 1, Велес</p>
          <p style="margin: 4px 0;">📞 075 288 395</p>
        </div>
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
