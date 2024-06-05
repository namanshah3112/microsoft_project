const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
   
  });
  // email options

  const mailOptions = {
    from: 'TestUser <testuser@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html
  };
  // send email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;


 // service: 'Gmail',
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   pass: process.env.EMAIL_PASSWORD,
    // },
    //Active in gmail "LESS SECURE APP" options

    //gmail not recomended as gmail will make emailid as spam