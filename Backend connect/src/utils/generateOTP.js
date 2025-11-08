export default function generateOTP(length = 6) {
  try {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10); // chiffre aléatoire
    }
    return otp;
  } catch (err) {
    console.error("❌ Erreur génération OTP :", err);
    throw { status: 500, message: "Impossible de générer un OTP" };
  }
}
