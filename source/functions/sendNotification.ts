import nodemailer from 'nodemailer';
import config from '../config/config';
import logging from '../config/logging';

const NAMESPACE = 'Cron: EID Sidechain';

function sendEmail(subject: string, to: string, text: string, html: string, attachments?: any) {
    logging.info(NAMESPACE, 'Started sending email');

    const transporter = nodemailer.createTransport({
        host: config.smtpCreds.smtpServer,
        port: config.smtpCreds.smtpPort,
        secure: config.smtpCreds.smtpPort.toString() === '465' ? true : false,
        auth: {
            user: config.smtpCreds.smtpUser,
            pass: config.smtpCreds.smtpPass
        },
        tls: {
            rejectUnauthorized: false
        },
        requireTLS: config.smtpCreds.smtpTls
    });

    // send mail with defined transport object
    transporter
        .sendMail({
            from: config.smtpCreds.sender, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
            attachments
        })
        .then((info) => {
            logging.info(NAMESPACE, `Finished sending email: ${JSON.stringify(info)}`);
        });
}

/* TODO: How to send email
    const subject = 'Profile Email verification';
    const text = `test text`;
    const html = `test html <a href="https://getdids.com">hello</a> to proceed with Profile Onboarding process`;
    sendNotification.sendEmail(subject, config.smtpCreds.sender, text, html); */

export default { sendEmail };
