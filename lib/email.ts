import 'server-only'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'Sabifin <onboarding@resend.dev>'
const PORTAL_URL = process.env.NEXT_PUBLIC_URL ?? 'https://sabifin-portal.vercel.app'

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)
}

const CONDITION_LABELS: Record<string, string> = {
  greater_than: 'superó el límite',
  less_than:    'cayó por debajo del límite',
  equals:       'igualó el valor objetivo',
  changed:      'cambió respecto al último chequeo',
}

export async function sendAlertEmail({
  to,
  clientName,
  column,
  condition,
  threshold,
  currentValue,
}: {
  to:           string
  clientName:   string
  column:       string
  condition:    string
  threshold?:   number | null
  currentValue: number
}): Promise<void> {
  const condLabel  = CONDITION_LABELS[condition] ?? condition
  const currentFmt = formatARS(currentValue)
  const threshFmt  = threshold != null ? formatARS(threshold) : null

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f0;margin:0;padding:40px 20px;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#2e2c2b;padding:22px 28px;display:flex;align-items:center;gap:12px;">
      <div style="background:#3d3b39;width:36px;height:36px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;color:#e8e3d8;flex-shrink:0;">SF</div>
      <div style="display:inline-block;margin-left:12px;">
        <div style="color:#e8e3d8;font-weight:700;font-size:15px;line-height:1.2;">Sabifin</div>
        <div style="color:rgba(245,240,232,0.5);font-size:12px;">Alerta financiera</div>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:32px 28px;">
      <h1 style="margin:0 0 8px;font-size:20px;color:#1a1a18;font-weight:700;">Condición alcanzada</h1>
      <p style="margin:0 0 24px;color:#6b6b63;font-size:14px;line-height:1.5;">
        Hola <strong>${clientName}</strong>, una de tus alertas financieras se activó.
      </p>

      <!-- Alert detail box -->
      <div style="background:#f8f7f4;border-radius:8px;padding:20px 22px;margin-bottom:28px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:7px 0;color:#6b6b63;font-size:13px;">Columna</td>
            <td style="padding:7px 0;color:#1a1a18;font-size:13px;font-weight:600;text-align:right;">${column}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#6b6b63;font-size:13px;">Situación</td>
            <td style="padding:7px 0;color:#1a1a18;font-size:13px;font-weight:600;text-align:right;">${condLabel}</td>
          </tr>
          ${threshFmt ? `
          <tr>
            <td style="padding:7px 0;color:#6b6b63;font-size:13px;">Límite configurado</td>
            <td style="padding:7px 0;color:#1a1a18;font-size:13px;font-weight:600;text-align:right;">${threshFmt}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:7px 0;border-top:1px solid #e8e3d0;color:#6b6b63;font-size:13px;padding-top:14px;">Valor actual</td>
            <td style="padding:7px 0;border-top:1px solid #e8e3d0;font-size:18px;font-weight:700;text-align:right;color:#2d6a4f;padding-top:14px;">${currentFmt}</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <a href="${PORTAL_URL}/dashboard"
         style="display:block;background:#2d6a4f;color:#ffffff;text-align:center;padding:13px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Ver mi portal financiero →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:18px 28px;border-top:1px solid #e8e3d0;text-align:center;">
      <p style="margin:0;color:#9e9e8e;font-size:12px;">
        Sabifin Consultora Financiera ·
        <a href="${PORTAL_URL}/dashboard/alertas" style="color:#9e9e8e;text-decoration:underline;">Gestionar alertas</a>
      </p>
    </div>

  </div>
</body>
</html>`

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `Alerta Sabifin: ${column} ${condLabel}`,
    html,
  })
}
