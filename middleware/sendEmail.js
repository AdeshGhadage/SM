const sendEmail = async (transporter, type, body, subject) =>{
    const mailData = {from: `${body.from}`,
        to: `${body.to}`,  
        subject: `${body.subject}`,
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; text-align: center;">Registration Successful!</h2>
            <p style="color: #555;">Dear Participant,</p>
            <p style="color: #555; line-height: 1.6;">
              Thank you for registering with us. We are excited to have you on board. Please check your SM_ID below for future refernce.
            </p>
            <p style="text-align: center; margin: 30px 0;">
              <button style="background-color: #28a745; color: blue; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ${body.sm_id}
              </button>
            </p>
            
            <p style="color: #555; line-height: 1.6;">Best regards, <br/>Samudramanthan</p>
          </div>
        </div>`
    }


    try {
        const info = await transporter.sendMail(mailData);
        console.log("Email sent successfully:", info.response);
        return info;
      } catch (err) {
        console.error(err)
      }
  
}

module.exports = sendEmail