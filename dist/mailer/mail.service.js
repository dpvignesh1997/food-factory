"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let nodemailer = require('nodemailer');
class Mailer {
    constructor() {
        this._transporter = nodemailer.createTransport({
            service: 'gmail',
            secureConnection: true,
            port: 587,
            auth: {
                user: 'no-reply@altiussolution.com',
                pass: '@ltius@123'
            }
        });
    }
    sendMail(toAddr, summary, subject, attachments) {
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
                    }
                    else {
                        console.log('Welcome Mail sent: ' + info.response);
                        resolve(info);
                        return;
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.Mailer = Mailer;
//# sourceMappingURL=mail.service.js.map