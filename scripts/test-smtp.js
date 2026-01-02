import nodemailer from 'nodemailer';

(async ()=>{
  const transporter = nodemailer.createTransport({
    host: 'serwer2562803.home.pl',
    port: 587,
    secure: false,
    auth: { user: 'admin', pass: 'Milosz.1205' },
    tls: { rejectUnauthorized: false }
  });
  try{
    await transporter.verify();
    console.log('SMTP verify OK');
    const info = await transporter.sendMail({
      from: '"PALKAMTM" <aktywacja@palkamtm.pl>',
      to: 'test+copilot@example.com',
      subject: 'Test SMTP',
      text: 'Test'
    });
    console.log('send info:', info);
  }catch(e){
    console.error('SMTP error:', e);
    process.exit(2);
  }
})();
