import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { APIError } from '../api/apiWrapper';
import { Verifyservice, ResendOTPService } from "../api/VerifyService";
import { useSearchParams } from "react-router-dom";

interface VerifyResponse {
  success: boolean;
  message: string;
}

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isOTPExpired, setIsOTPExpired] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage("");
    if (!email) return setError("Email manquant, impossible de vérifier le compte.");
    try {
      const response: VerifyResponse = await Verifyservice(email, otp);
      setMessage(response.message);
      if (response.success) navigate("/");
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
        // Si le code d'erreur est 429, le code est périmé
        if (err.statusCode === 429) {
          setIsOTPExpired(true);
        }
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    }
  };

  const handleResendOTP = async () => {
    if (!email) return setError("Email manquant, impossible de renvoyer le code.");
    try {
      await ResendOTPService(email);
      setMessage("Un nouveau code OTP a été envoyé à votre adresse email.");
      setIsOTPExpired(false);
      setError(null);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de l'envoi du code.");
      }
    }
  };

  return (
    <div className="auth-card">
      <h2>Vérification de votre compte</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Entrez le code"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Valider</button>
      </form>
      {isOTPExpired && (
        <button onClick={handleResendOTP} className="resend-button">
          Renvoyer le code
        </button>
      )}
      {message && <p className="info">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
