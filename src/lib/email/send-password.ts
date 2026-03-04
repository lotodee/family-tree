import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPasswordEmailParams {
  to: string;
  name: string;
  password: string;
}

export async function sendPasswordEmail({
  to,
  name,
  password,
}: SendPasswordEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Grandpa Michael's 100th <onboarding@resend.dev>",
      to,
      subject: "Welcome to Grandpa Michael's 100th Birthday!",
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background-color: #FFF8F0; border-radius: 12px;">
          <h1 style="color: #6B1D2A; font-size: 24px; margin-bottom: 8px;">Welcome, ${name}!</h1>
          <p style="color: #2D1810; font-size: 16px; line-height: 1.6;">
            You've joined the family tree for Grandpa Michael's 100th birthday celebration on <strong>March 14, 2026</strong>.
          </p>
          <p style="color: #2D1810; font-size: 16px; line-height: 1.6;">
            Here is your login password. Save it somewhere safe — you'll need it to log back in and share your stories.
          </p>
          <div style="background-color: #FFFDF7; border: 2px solid #C4973B; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="color: #6B5B4E; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Your Password</p>
            <p style="color: #2D1810; font-size: 28px; font-weight: bold; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 2px;">${password}</p>
          </div>
          <p style="color: #6B5B4E; font-size: 14px; line-height: 1.6;">
            Log in anytime at your app link using your email (<strong>${to}</strong>) and this password.
          </p>
          <hr style="border: none; border-top: 1px solid #E8D5A3; margin: 24px 0;" />
          <p style="color: #6B5B4E; font-size: 13px; text-align: center;">
            Made with love for the Ademiluyi family
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    // Do NOT throw — email failure should not block registration.
    // The password is shown on screen as the primary delivery method.
    return { success: false, error };
  }
}
