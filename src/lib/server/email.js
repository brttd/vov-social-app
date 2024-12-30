import { createTransport } from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '$env/static/private';

const transporter = createTransport({
	host: SMTP_HOST,
	port: SMTP_PORT,
	secure: SMTP_PORT === 465 ? true : false,
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS
	},
	tls: {
		rejectUnauthorized: false
	}
});

async function send(data) {
	if (!data.from) {
		data.from = '"VOVLE" <' + SMTP_USER + '>';
	}

	// TODO: automatically set 'text' from 'html' if text is not set
	return await transporter.sendMail(data);
}

export { send };
