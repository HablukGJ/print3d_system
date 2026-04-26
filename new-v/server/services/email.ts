import nodemailer from 'nodemailer';

// Lazy initialization of transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (!transporter) {
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT || '587');
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            console.warn('SMTP configuration missing. Email notifications will be skipped.');
            return null;
        }

        transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });
    }
    return transporter;
}

export async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text: string, html?: string }) {
    const t = getTransporter();
    if (!t) return;

    try {
        const info = await t.sendMail({
            from: `"3D Print System" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log(`Email sent to ${to}: ${subject}`);
    } catch (error: any) {
        if (error.code === 'EAUTH' || error.responseCode === 535) {
            console.error(`SMTP Auth Error: Check if you are using an App Password for Gmail. Error: ${error.message}`);
        } else {
            console.error(`Failed to send email to ${to}:`, error);
        }
    }
}
