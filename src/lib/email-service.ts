import {
  MailerSend,
  EmailParams,
  Sender,
  Recipient
} from "mailersend";
import { env } from "~/env";

const mailerSend = new MailerSend({
  apiKey: env.MAILERSNED_API_KEY,
});

interface EmailService {
  recipients: {
    email: string;
    name: string;
  }[];
  htmlContent: string;
  subject: string;
}

export const sendEmail = async (pData: EmailService) => {

  // Constants
  const sentFrom = new Sender(env.EMAIL_USER, "JaKaMa-noreply");
  const recipients = pData.recipients.map((recipient) => {
    return new Recipient(recipient.email, recipient.name);
  });

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(pData.subject)
    .setHtml(pData.htmlContent);

  mailerSend.email.send(emailParams)
    .then(response => {
      console.log("Email sent successfully:", response);
    })
    .catch(error => {
      console.error("Error sending email:", error);
    })
};