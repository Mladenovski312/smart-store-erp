import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { orderId, customerName, customerEmail, deliveryCity } = await req.json();

        if (!customerEmail || !orderId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const shortId = orderId.slice(0, 8).toUpperCase();

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
            Здраво ${customerName}, сакаме да ве известиме дека вашата нарачка <strong>#${shortId}</strong> е предадена на курирска служба и е на пат кон вас.
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
                <td style="font-size: 14px; color: #333; padding: 6px 0; text-align: right;">${deliveryCity || 'Македонија'}</td>
              </tr>
              <tr>
                <td style="font-size: 13px; color: #888; padding: 6px 0; font-weight: 600;">Плаќање</td>
                <td style="font-size: 14px; color: #333; padding: 6px 0; text-align: right;">При достава (COD)</td>
              </tr>
            </table>
          </div>

          <!-- Note -->
          <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 16px;">
            <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
              📦 Очекувајте пратката во рок од <strong>1-3 работни дена</strong>. Курирот ќе ве контактира пред достава.
            </p>
          </div>

          <p style="margin: 24px 0 0; font-size: 13px; color: #888; text-align: center; line-height: 1.5;">
            За дополнителни прашања, контактирајте не на <strong>075 288 395</strong>.
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
            from: 'ИНТЕР СТАР ЏАМБО <onboarding@resend.dev>',
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
