const nodemailer = require('nodemailer');

var mailCenter = 'mailcenter.hunghoang.test.149@gmail.com';

class mailTransport {
	constructor() {
		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: mailCenter,
				pass: 'rfejnqbyylbcrwmo',
			},
		});
	}

	async send(desMail, subject, text) {
		var mailOptions = {};
		mailOptions.from = mailCenter;
		mailOptions.to = desMail;
		mailOptions.subject = subject;
		mailOptions.text = text;
		// because sendMail is a callback function, so we need to wrap it in a promise
		const sendMail = new Promise(
			function (resolve, reject) {
				this.transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						console.log(error);
						reject(error);
					} else {
						console.log('Email sent: ' + info.response);
						resolve();
					}
				});
			}.bind(this)
		);
		await sendMail;
	}
}

module.exports = new mailTransport();
