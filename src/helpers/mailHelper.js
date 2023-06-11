const nodemailer = require("nodemailer");

var mailCenter = 'mailcenter.hunghoang.test.149@gmail.com'


class mailTransport
{
    constructor(){
        this.transporter =  nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: mailCenter,
              pass: 'rfejnqbyylbcrwmo'
            }
          });
    }

    async send(desMail, subject, text)
    {
        var mailOptions = {}
        mailOptions.from = mailCenter
        mailOptions.to = desMail
        mailOptions.subject = subject
        mailOptions.text = text

        this.transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });
    }
}


module.exports = new mailTransport()