import nodemailer from 'nodemailer';

const formatDate = (d) =>
  new Date(d).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });


export const sendCancellationEmail = async (to, tutorName, startTime, endTime) => {
  try {
    // Tworzy testowe konto Ethereal
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailOptions = {
      from: 'no-reply@yourapp.com',
      to,
      subject: 'Anulowanie zajęć',
      text: `Korepetytor ${tutorName} anulował zajęcia zaplanowane na ${formatDate(startTime)} - ${formatDate(endTime)}.`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Mail wysłany (Ethereal):', info.messageId);
    console.log('Podgląd maila:', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error('Błąd wysyłki maila:', error);
  }
};
