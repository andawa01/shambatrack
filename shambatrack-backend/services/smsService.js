import AfricasTalking from "africastalking";

const client = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = client.SMS;

/**
 * Send SMS to one or multiple numbers
 */
export async function sendSMS(phone, message) {
  try {
    const response = await sms.send({
      to: Array.isArray(phone) ? phone : [phone],
      message,
      from: process.env.AT_SENDER_ID, // optional but recommended
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("SMS send failed:", error);

    return {
      success: false,
      error,
    };
  }
}
