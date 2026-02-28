import sgMail from "@sendgrid/mail";
import dotenv from 'dotenv';
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
export const sendOrderConfirmationEmail = async (
  to: string,
  orderId: string
) => {
  const msg = {
    to,
    from: "infoqualitywoods@gmail.com", 
    subject: "Your Order Has Been Received!",
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your order ID is <strong>${orderId}</strong>.</p>
      <p>We’ll notify you as it moves through production.</p>
      <br/>
      <p>– The Quality Woods Team</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Confirmation email sent via SendGrid");
  } catch (error: any) {
    console.error("❌ SendGrid Error Body:", error.response?.body);
    console.error("❌ Full Error:", error);
  }
};