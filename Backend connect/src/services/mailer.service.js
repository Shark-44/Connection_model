import nodemailer from "nodemailer";

// Fonction pour envoyer un mail
const sendMail = async (to, subject, html) => {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Support App" <no-reply@app.com>',
    to,
    subject,
    html,
  });

  console.log("📩 Lien de prévisualisation :", nodemailer.getTestMessageUrl(info));
};

0
// Envoi du mail OTP avec lien vers la page Verify
export const sendVerificationEmail = async (email, otp) => {
  const verifyLink = `http://localhost:5173/Verify?email=${encodeURIComponent(email)}`;

  await sendMail(
    email,
    "Vérification de votre compte",
    `<p>Voici votre code de vérification :</p>
     <h2>${otp}</h2>
     <p>Code valide 10 minutes.</p>
     <p>Accédez directement à la page de vérification : <a href="${verifyLink}">${verifyLink}</a></p>`
  );

  console.log("📩 Lien de prévisualisation OTP :", verifyLink); // <-- ici, à l'intérieur
};

// Envoi du mail reset password
export const sendResetEmail = async (email, token) => {
  const resetLink = `http://localhost:5173/Reset?token=${token}`;
  await sendMail(
    email,
    "Réinitialisation du mot de passe",
    `<p>Cliquez ici pour réinitialiser votre mot de passe : <a href="${resetLink}">${resetLink}</a></p>`
  );
};
