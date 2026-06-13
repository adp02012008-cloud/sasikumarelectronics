import { useState } from "react";

import API from "../api/axios";

import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

const Login = () => {

  const { login } =
    useContext(AuthContext);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        const res =
          await API.post(
            "/auth/login",
            {
              email,
              password,
            }
          );

        login(
          res.data.user,
          res.data.token
        );

        alert("Login Successful");

      } catch (error) {

        alert(
          error.response?.data?.message ||
          "Login Failed"
        );

      }
    };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <button type="submit">
          Login
        </button>

      </form>
    </div>
  );
};

export default Login;