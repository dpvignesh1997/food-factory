let nodemailer = require('nodemailer');

export class Mailer {
    _transporter = nodemailer.createTransport({
        service: 'gmail',
        secureConnection: true,
        port: 587,
        auth: {
            user: 'no-reply@altiussolution.com',
            pass: '@ltius@123'
        }
    });

    constructor() {
    }

    sendMail(toAddr, summary: string, subject: string, attachments: Array<any>) {
        return new Promise((resolve, reject) => {
            try {
                let mailOptions = {
                    from: 'ALTIUS<no-reply@altius.com>',
                    replyTo: 'no-reply@altius.com',
                    sender: 'ALTIUS<no-reply@altius.com>',
                    to: toAddr,
                    subject,
                    text: summary,
                    attachments
                };
                this._transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        reject(error);
                        return;
                    } else {
                        console.log('Welcome Mail sent: ' + info.response);
                        resolve(info)
                        return;
                    }
                });
            } catch (error) {
                reject(error)
            }
        })

    }
}