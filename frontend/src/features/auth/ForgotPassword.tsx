import React, { useState } from "react";
import styled from "styled-components";
import { userAPI } from "../../services/api";
import { toast } from "sonner";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { Mail, Key, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailTrim = email.trim();
    if (!emailTrim) {
      toast.error("Email is required");
      return;
    }

    setSubmitting(true);
    try {
      await userAPI.forgotPassword(emailTrim);
      toast.success("Password reset token sent to your email");
      setStep("reset");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset token");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const tokenTrim = token.trim();
    const newPwd = newPassword;
    const confirmPwd = confirmPassword;

    if (!tokenTrim || !newPwd || !confirmPwd) {
      toast.error("All fields are required");
      return;
    }

    if (newPwd !== confirmPwd) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      console.log("RESET PAYLOAD:", { token: tokenTrim, newPassword: newPwd, confirmPassword: confirmPwd });
      await userAPI.resetPassword(tokenTrim, newPwd, confirmPwd);
      toast.success("Password reset successfully! You can now login.");
      setStep("email");
      setEmail("");
      setToken("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="container">
        <div className="card">
          <div className="topRow">
            <Link to="/login" className="backLink">
              <ArrowLeft size={18} />
              Back
            </Link>
            <a className="login">{step === "email" ? "Forgot Password" : "Reset Password"}</a>
          </div>

          {step === "email" && (
            <form onSubmit={handleEmail} className="formInner" noValidate>
              <div className="inputBox">
                <Mail className="icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span>Email</span>
              </div>

              <button className="enter" type="submit" disabled={submitting || !email.trim()}>
                {submitting ? <Loader /> : "Send Token"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleReset} className="formInner" noValidate>
              <div className="inputBox">
                <Key className="icon" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <span>Token</span>
              </div>

              <div className="inputBox">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span>New Password</span>
              </div>

              <div className="inputBox">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span>Confirm</span>
              </div>

              <button
                className="enter"
                type="submit"
                disabled={
                  submitting ||
                  !token.trim() ||
                  !newPassword.trim() ||
                  !confirmPassword.trim()
                }
              >
                {submitting ? <Loader /> : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
  }

  .card {
    width: 360px;
    background: #eaeaea;
    box-shadow: 16px 16px 32px #c8c8c8, -16px -16px 32px #fefefe;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .topRow {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .backLink {
    color: #000;
    text-decoration: none;
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 14px;
  }

  .login {
    color: #000;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: bold;
    font-size: large;
  }

  .formInner {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .inputBox {
    --icon-gap: 48px;
    position: relative;
    width: 100%;
  }

  /* icon sits inside the input */
  .inputBox .icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
    z-index: 3;
  }

  /* input has left padding for the icon; increased vertical padding for nicer spacing */
  .inputBox input {
    width: 100%;
    padding: 16px 12px 12px var(--icon-gap); /* enough top padding so label doesn't overlap */
    outline: none;
    border: none;
    color: #000;
    font-size: 1em;
    background: transparent;
    border-left: 2px solid #000;
    border-bottom: 2px solid #000;
    transition: padding 0.18s ease, border 0.18s ease;
    border-bottom-left-radius: 8px;
  }

  /* floating label - positioned relative to the icon, vertically centered */
  .inputBox span {
    position: absolute;
    left: var(--icon-gap);            /* start after the icon */
    top: 50%;
    transform: translateY(-50%);
    padding: 0 8px;
    pointer-events: none;
    font-size: 12px;
    color: #000;
    text-transform: uppercase;
    transition: all 0.18s ease;
    letter-spacing: 3px;
    background: transparent;
    border-radius: 6px;
    z-index: 4;
  }

  /* on focus/when valid move label up and reduce size, add background for readability,
     and increase input top padding so typed text is not hidden */
  .inputBox input:focus ~ span,
  .inputBox input:valid ~ span {
    top: -8px;
    transform: translateY(0);
    font-size: 10px;
    padding: 3px 8px;
    background: #000;
    color: #fff;
    letter-spacing: 2px;
  }

  .inputBox input:focus,
  .inputBox input:valid {
    border: 2px solid #000;
    border-radius: 8px;
    padding: 22px 12px 12px var(--icon-gap); /* add extra top padding when label floats */
  }

  .enter {
    height: 44px;
    width: 140px;
    border-radius: 6px;
    border: 2px solid #000;
    cursor: pointer;
    background-color: transparent;
    transition: 0.3s;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 6px;
  }

  .enter:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .enter:hover {
    background-color: #000;
    color: #fff;
  }
`;