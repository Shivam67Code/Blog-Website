import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "./AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Loader from "../../components/Loader";

export default function Login() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState<"email" | "username">("email");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const credentials = loginMethod === "email"
        ? { email, password }
        : { username, password };
      await login(credentials);
      navigate(from, { replace: true });
    } catch { }
  };

  return (
    <StyledWrapper>
      <div className="container">
        <form className="card" onSubmit={handleSubmit} noValidate>
          <a className="login">Login</a>

          <div className="toggleRow">
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`toggleBtn ${loginMethod === "email" ? "active" : ""}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("username")}
              className={`toggleBtn ${loginMethod === "username" ? "active" : ""}`}
            >
              Username
            </button>
          </div>

          <div className="inputBox">
            {loginMethod === "email" ? (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span>Email</span>
              </>
            ) : (
              <>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <span>Username</span>
              </>
            )}
          </div>

          <div className="inputBox relativeBox">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span>Password</span>

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="eyeBtn"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                /* eye-off icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.96 9.96 0 014.122.853M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              ) : (
                /* eye icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button className="enter" type="submit" disabled={loading}>
            <span className="button-text">{loading ? <Loader /> : "Login"}</span>
          </button>

          <div style={{ marginTop: 8 }}>
            <Link to="/forgot-password" style={{ fontSize: 12, color: "#000" }}>
              Forgot password?
            </Link>
          </div>

          <div style={{ marginTop: 8, textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "#666" }}>
              Don't have an account?{" "}
            </span>
            <Link 
              to="/register" 
              className="registerLink"
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
  }

  .login {
    color: #000;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: block;
    font-weight: bold;
    font-size: x-large;
  }

  .card {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    width: 50vw;
    max-width: 600px;
    min-width: 400px;
    flex-direction: column;
    gap: 22px;
    background: #e3e3e3;
    box-shadow: 16px 16px 32px #c8c8c8, -16px -16px 32px #fefefe;
    border-radius: 8px;
    padding: 40px;
  }

  .toggleRow {
    display: flex;
    gap: 8px;
  }

  .toggleBtn {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    border: none;
    background: #d1d5db;
    color: #111827;
    cursor: pointer;
  }

  .toggleBtn.active {
    background: #000;
    color: #fff;
  }

  .inputBox {
    position: relative;
    width: 80%;
    max-width: 500px;
  }

  .inputBox input[type="text"],
  .inputBox input[type="email"],
  .inputBox input[type="password"] {
    width: 100%;
    padding: 10px;
    outline: none;
    border: none;
    color: #000;
    font-size: 1em;
    background: transparent;
    border-left: 2px solid #000;
    border-bottom: 2px solid #000;
    transition: 0.1s;
    border-bottom-left-radius: 8px;
    box-sizing: border-box;
  }

  .inputBox span {
    margin-top: 5px;
    position: absolute;
    left: 0;
    transform: translateY(-4px);
    margin-left: 10px;
    padding: 10px;
    pointer-events: none;
    font-size: 12px;
    color: #000;
    text-transform: uppercase;
    transition: 0.5s;
    letter-spacing: 3px;
    border-radius: 8px;
  }

  .inputBox input:valid ~ span,
  .inputBox input:focus ~ span {
    transform: translateX(113px) translateY(-15px);
    font-size: 0.8em;
    padding: 5px 10px;
    background: #000;
    letter-spacing: 0.2em;
    color: #fff;
    border: 2px;
  }

  .inputBox input:valid,
  .inputBox input:focus {
    border: 2px solid #000;
    border-radius: 8px;
  }

  .relativeBox {
    position: relative;
  }

  .eyeBtn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    color: #111827;
  }

  .enter {
    height: 45px;
    width: 120px;
    border-radius: 5px;
    border: 2px solid #000;
    cursor: pointer;
    /* base background (subtle light) */
    background: linear-gradient(145deg, #e3e3e3, #ffffff);
    transition: all 0.45s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 2px;
    margin-bottom: 1em;
    position: relative;
    overflow: hidden;
    z-index: 1; /* so ::before sits under content */
    color: #000;
  }

  .button-text {
    position: relative;
    z-index: 2;
    transition: color 0.25s ease, transform 0.25s ease;
    display: inline-block;
  }

  /* animated orange sliding background */
  .enter::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa85c 100%);
    transition: left 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 0;
  }

  .enter:hover:not(:disabled) {
    border-color: #ff6b35;
    box-shadow: 0 6px 25px rgba(255, 107, 53, 0.35);
    transform: translateY(-3px);
    /* keep text white and above the sliding bg */
    color: #fff;
  }

  .enter:hover .button-text {
    color: #fff;
    transform: scale(1.03);
  }

  .enter:hover::before {
    left: 0;
  }

  .enter:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .registerLink {
    font-size: 13px;
    font-weight: bold;
    color: #000;
    text-decoration: none;
    padding: 4px 12px;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
    transition: all 0.3s ease;
  }

  .registerLink::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .registerLink:hover::after {
    transform: scaleX(1);
  }

  .registerLink:hover {
    filter: brightness(1.2);
  }

  @media (max-width: 768px) {
    .card {
      width: 90vw;
      min-width: 300px;
      padding: 30px 20px;
    }

    .inputBox {
      width: 90%;
    }
  }
`;