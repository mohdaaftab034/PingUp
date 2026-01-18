import nodemailer from 'nodemailer'

//Create a transporter object using the SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

// Verify transporter configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error(" Email transporter configuration error:", error);
    } else {
        console.log(" Email transporter configured successfully");
    }
})

const sendEmail = async ({to, subject, body})=> {
    try {
        if (!to || !subject || !body) {
            throw new Error("Missing required email parameters: to, subject, body")
        }

        if (!process.env.SENDER_EMAIL) {
            throw new Error("SENDER_EMAIL environment variable is not configured")
        }

        const response = await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            html: body
        })
        
        console.log(` Email sent successfully to ${to}`);
        return response
    } catch (error) {
        console.error(` Failed to send email to ${to}:`, error.message);
        throw error
    }
}

export default sendEmail;