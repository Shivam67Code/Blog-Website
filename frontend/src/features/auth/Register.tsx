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
              autoComplete="name"
            />
            <span>Full Name</span>
          </div>

          <div className="inputBox">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <span>Username</span>
          </div>

          <div className="inputBox">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <span>Email</span>
          </div>

          <div className="inputBox">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <span>Password</span>
          </div>

          <div className="inputBox fileBox">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              required
            />
            <span>Avatar</span>
          </div>

          <button className="enter" type="submit" disabled={loading}>
            {loading ? <Loader /> : "Create"}
          </button>

          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <Link to="/login" style={{ fontSize: 12, color: "#000" }}>
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
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
    min-height: 450px;
    width: 360px;
    flex-direction: column;
    gap: 20px;
    background: #eaeaea;
    box-shadow: 16px 16px 32px #c8c8c8, -16px -16px 32px #fefefe;
    border-radius: 8px;
    padding: 24px;
  }

  .inputBox {
    position: relative;
    width: 100%;
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
  }

  /* file input styled smaller but consistent */
  .inputBox.fileBox input[type="file"] {
    width: 100%;
    padding: 8px 6px;
    background: transparent;
    border: none;
    cursor: pointer;
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
  .inputBox input:focus ~ span,
  .inputBox.fileBox input:focus ~ span {
    transform: translateX(170px) translateY(-15px);
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

  .enter {
    height: 45px;
    width: 120px;
    border-radius: 5px;
    border: 2px solid #000;
    cursor: pointer;
    background-color: transparent;
    transition: 0.5s;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 2px;
    margin-bottom: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .enter:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .enter:hover {
    background-color: rgb(0, 0, 0);
    color: white;
  }
`;
