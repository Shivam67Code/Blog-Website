import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../../components/Loader";

export default function Register() {
  const { register, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    if (avatar) formData.append("avatar", avatar);

    try {
      await register(formData);
      navigate("/");
    } catch {}
  };

  return (
    <StyledWrapper>
      <div className="container">
        <form className="card" onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
          <a className="login">Register</a>

          <div className="inputBox">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <span>Full Name</span>
          </div>

          <div className="inputBox">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <span>Username</span>
          </div>

          <div className="inputBox">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span>Email</span>
          </div>

          <div className="inputBox">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span>Password</span>
          </div>

          <div className="inputBox fileBox">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              className="file-input"
              required
            />
          </div>

          <button className="enter" type="submit" disabled={loading}>
            <span className="button-text">{loading ? <Loader /> : "Create"}</span>
            <span className="button-bg"></span>
          </button>

          <div style={{ marginTop: 8, textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "#666" }}>
              Already have an account?{" "}
            </span>
            <Link 
              to="/login" 
              className="loginLink"
            >
              Login
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
    min-height: 550px;
    width: 50vw;
    max-width: 600px;
    min-width: 400px;
    flex-direction: column;
    gap: 28px;
    background: #e3e3e3;
    box-shadow: 16px 16px 32px #c8c8c8, -16px -16px 32px #fefefe;
    border-radius: 8px;
    padding: 40px;
  }

  .inputBox {
    position: relative;
    width: 80%;
    max-width: 500px;
  }

  .inputBox input[type="text"],
  .inputBox input[type="email"],
  .inputBox input[type="password"],
  .inputBox .file-input {
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

  .inputBox .file-input {
    background: transparent;
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
  .inputBox input:focus,
  .inputBox .file-input:focus {
    border: 2px solid #000;
    border-radius: 8px;
  }

  .enter {
    height: 45px;
    width: 120px;
    border-radius: 5px;
    border: 2px solid #000;
    cursor: pointer;
    background: linear-gradient(145deg, #e3e3e3, #ffffff);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 2px;
    margin-bottom: 1em;
    position: relative;
    overflow: hidden;
    z-index: 1;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .button-text {
    position: relative;
    z-index: 2;
    transition: all 0.4s ease;
    display: inline-block;
  }

  .button-bg {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa85c 100%);
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 1;
  }

  .enter:hover {
    border-color: #ff6b35;
    box-shadow: 0 6px 25px rgba(255, 107, 53, 0.4);
    transform: translateY(-3px);
  }

  .enter:hover .button-bg {
    left: 0;
  }

  .enter:hover .button-text {
    color: white;
    transform: scale(1.05);
  }

  .enter:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .enter:disabled:hover {
    transform: none;
    border-color: #000;
  }

  .enter:disabled .button-bg {
    left: -100%;
  }

  .enter:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
  }

  .loginLink {
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
    display: inline-block;
  }

  .loginLink::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }

  .loginLink:hover::before {
    width: 100%;
  }

  .loginLink:hover {
    filter: brightness(1.2);
    transform: translateY(-2px);
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