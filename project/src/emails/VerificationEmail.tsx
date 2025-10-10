import { createTransporter } from "@/lib/nodemailer";

interface VerificationEmailOptions {
  userName: string;
  verificationCode: string;
  email: string;
}

export async function sendVerificationEmail({
  email,
  userName,
  verificationCode,
}: VerificationEmailOptions) {
  try {
    const transporter = await createTransporter();

    // Optional: improve inbox preview
    const preheader =
      "Use this code to verify your email. It expires in 10 minutes.";

    await transporter.sendMail({
      from: `"SkillNexus" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Your SkillNexus Verification Code",
      text: `Hi ${userName},

Welcome to SkillNexus!

Your verification code is: ${verificationCode}

This code will expire in 10 minutes. If you didn't request this, you can ignore this email.

— The SkillNexus Team
`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <title>SkillNexus Verification</title>
  <style>
    /* Basic reset & dark mode */
    body {
      margin: 0; padding: 0;
      background: #0b1220; /* subtle dark background for outer edge */
    }
    .wrapper {
      width: 100%;
      background: linear-gradient(135deg, #0b1220 0%, #0b1220 40%, #0f172a 100%);
      padding: 32px 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .container {
      max-width: 640px; margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
    }
    .card {
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.05);
    }
    .header {
      background: radial-gradient(1200px 400px at 0% 0%, #22d3ee 0%, transparent 40%),
                  radial-gradient(1000px 400px at 100% 0%, #34d399 0%, transparent 45%),
                  #0f172a;
      text-align: center;
      padding: 36px 24px;
      color: #e5f9ff;
    }
    .brand {
      font-size: 24px; font-weight: 800; letter-spacing: 0.4px;
    }
    .subtitle {
      margin-top: 6px; font-size: 13px; color: #cdeffd;
    }
    .content {
      padding: 28px 24px 8px 24px; background: #ffffff;
      line-height: 1.6; color: #0f172a;
    }
    .hello { font-weight: 700; color: #0f172a; }
    .code-wrap {
      background: #f1f5f9;
      border-radius: 12px;
      text-align: center;
      padding: 20px 16px;
      margin: 18px 0 6px 0;
      border: 1px solid #e2e8f0;
    }
    .code {
      font-size: 32px; letter-spacing: 6px; font-weight: 800; color: #0f172a;
    }
    .expires { font-size: 13px; color: #475569; margin-top: 8px; }
    .cta-wrap { text-align: center; padding: 12px 24px 28px 24px; }
    .cta {
      display: inline-block; text-decoration: none;
      background: linear-gradient(90deg, #06b6d4, #10b981);
      color: #ffffff; font-weight: 600; border-radius: 10px;
      padding: 12px 20px; box-shadow: 0 6px 20px rgba(16,185,129,0.35);
    }
    .footer {
      padding: 18px 24px 28px 24px; font-size: 12px; color: #64748b; background: #ffffff;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }
    .muted { color: #64748b; }
    .legal { color: #94a3b8; font-size: 11px; margin-top: 10px; }
    .preheader {
      display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all;
    }
    @media (prefers-color-scheme: dark) {
      .card { background: #0b1220; }
      .content, .footer { background: #0b1220; color: #e2e8f0; }
      .code-wrap { background: #0f172a; border-color: #0b1220; }
      .code { color: #e2e8f0; }
      .expires { color: #94a3b8; }
      .footer { border-top-color: #111827; }
      .muted { color: #94a3b8; }
      .legal { color: #64748b; }
    }
  </style>
</head>
<body>
  <!-- Preheader: shows in inbox preview -->
  <div class="preheader">${preheader}</div>

  <div class="wrapper">
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="brand">SkillNexus</div>
          <div class="subtitle">Verify your email to continue</div>
        </div>

        <div class="content">
          <p class="hello">Hi ${userName},</p>
          <p>Welcome to <strong>SkillNexus</strong> — we’re excited to have you onboard.</p>
          <p>Use the code below to verify your email address and finish setting up your account:</p>

          <div class="code-wrap">
            <div class="code">${verificationCode}</div>
            <div class="expires">This code expires in <strong>10 minutes</strong>.</div>
          </div>

          <p class="muted">If you didn’t request this, you can safely ignore this email.</p>
        </div>

        <div class="cta-wrap">
          <a class="cta" href="${
            process.env.APP_URL ?? "#"
          }">Open SkillNexus</a>
        </div>

        <div class="footer">
          <div>© ${new Date().getFullYear()} <strong>SkillNexus</strong>. All rights reserved.</div>
          <div class="legal">Need help? Reach us at <a href="mailto:support@skillnexus.com">support@skillnexus.com</a></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
    });

    console.log(`Verification email sent to ${email}`);
    return { success: true, message: "Verification email sent successfully." };
  } catch (error: unknown) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email. Please try again later.",
    };
  }
}
