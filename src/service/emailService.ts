import config from "config";
import * as C from "../helpers/common";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export async function sendEmailSubscription(args: any) {
	await sendEmail(args.to, args.subject, args.body);
}

export async function sendEmail(to: string, subject: string, body: string) {

	const logBody: string = formatEmailForLog(body);

	if (config.get("email.sendingEmailsEnabled") !== true) {
		C.logI(`Email sent SKIPPED to "${to}" subject "${subject}" body "${logBody}"`);
		return;
	}

	const env = process.env.NODE_ENV;
	const transporter: nodemailer.Transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: config.get("email.username"),
			pass: config.get("email.password")
		}
	});
	const email: Mail.Options = {
		from: config.get("email.from"),
		to,
		subject: (env === "production") ? `Photo-Lib: ${subject}` : `Photo-Lib - ${env}: ${subject}`,
		text: body,
		html: body,
	};

	try {
		const info: nodemailer.SentMessageInfo = await transporter.sendMail(email);
		C.logD("Email sent response: " + JSON.stringify(info));

		if (info.rejected && info.rejected.length > 0) {
			C.logE(`Email sent to "${to}" subject "${subject}" body "${logBody}" was rejected: ${JSON.stringify(info)}`);
			throw new C.PhotoError("Send email was rejected");
		}

		C.logI(`Email sent to "${to}" subject "${subject}" body "${logBody}" response "${info.response}"`);

	} catch (e) {
		C.logE(`Error send email to "${to}" subject "${subject}" body "${logBody}"`, e);
		throw new C.PhotoError("Error send email");
	}
}

function formatEmailForLog(body: string) {
	if (!body) {
		return "<< undefined >>";
	}

	if (body.length > 100) {
		return body.substring(0, 100) + "...";
	}

	return body;
}