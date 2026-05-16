import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) => {
  try {
    const data = await getResend().emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};
