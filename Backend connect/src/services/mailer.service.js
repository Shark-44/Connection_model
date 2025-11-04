import nodemailer from "nodemailer";


// 🔹 Création d’un compte Ethereal pour test
export const sendResetEmail = async (email, token) => {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const resetLink = `http://localhost:5173/Reset?token=${token}`;

  const info = await transporter.sendMail({
    from: '"Support" <no-reply@monsite.com>',
    to: email,
    subject: "Réinitialisation du mot de passe",
    html: `<p>Voici votre lien : <a href="${resetLink}">${resetLink}</a></p>`,
  });

  console.log("Lien de test (console):", nodemailer.getTestMessageUrl(info));
};
