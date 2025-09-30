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
            {/* <span style={{ left: 0, marginLeft: 10 }}>Avatar</span> */}
          </div>

          <button className="enter" type="submit" disabled={loading}>
            {loading ? <Loader /> : "Create"}
          </button>

          <div style={{ marginTop: 8 }}>
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
    width: 300px; /* match login width */
    flex-direction: column;
    gap: 28px;
    background: #e3e3e3;
    box-shadow: 16px 16px 32px #c8c8c8, -16px -16px 32px #fefefe;
    border-radius: 8px;
    padding: 20px;
  }

  .inputBox {
    position: relative;
    width: 250px; /* match login input width */
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

  /* keep native file input visible and clickable; style lightly to match other inputs */
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
    width: 100px;
    border-radius: 5px;
    border: 2px solid #000;
    cursor: pointer;
    background-color: transparent;
    transition: 0.5s;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 2px;
    margin-bottom: 1em;
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