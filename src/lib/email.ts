import { OrderItem } from '@/lib/types';

/** HTML-escape user content to prevent XSS in emails. */
export function esc(text: string | number): string {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Render order items as an HTML table rows string. */
export function renderItemsHtml(items: OrderItem[]): string {
    return items.map(item => `
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
    `).join('');
}

/** Common email header with store logo. */
export const EMAIL_HEADER = `
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; background-color: #1e3a5f; color: white; padding: 10px 20px; border-radius: 12px; font-weight: 900; font-size: 16px; letter-spacing: -0.5px;">
      ИНТЕР СТАР <span style="color: #dc2626;">ЏАМБО</span>
    </div>
  </div>`;

/** Common email footer with store info. */
export const EMAIL_FOOTER = `
  <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #999; line-height: 1.6;">
    <p style="margin: 0;">ИНТЕР СТАР ЏАМБО</p>
    <p style="margin: 4px 0;">Народна Револуција 43, Куманово</p>
    <p style="margin: 4px 0;">📞 +389 31 422 656</p>
  </div>`;

/** Common items + subtotal table section for emails. */
export function renderOrderSummaryHtml(itemsHtml: string, subtotal: number, deliveryLabel = 'Не е вклучена'): string {
    return `
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
          <td style="font-size: 13px; color: #999; text-align: right; font-style: italic;">${deliveryLabel}</td>
        </tr>
        <tr>
          <td style="font-size: 15px; font-weight: 700; color: #111; padding: 12px 0 4px 0; border-top: 1px solid #e5e7eb; margin-top: 8px;">Вкупно</td>
          <td style="font-size: 16px; font-weight: 800; color: #1e40af; text-align: right; padding: 12px 0 4px 0; border-top: 1px solid #e5e7eb; margin-top: 8px;">${Number(subtotal).toLocaleString('de-DE')} ден</td>
        </tr>
      </table>`;
}
