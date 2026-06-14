import {
 useEffect,
 useState,
 useContext,
} from "react";

import {
 Link,
 useNavigate,
} from "react-router-dom";

import API from "../api/axios";

import {
 AuthContext,
} from "../context/AuthContext";

const Login = () => {
 const navigate = useNavigate();

 const {
  login,
 } = useContext(AuthContext);

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);

 useEffect(() => {
  const params = new URLSearchParams(
   window.location.search
  );

  const token = params.get("token");
  const userParam = params.get("user");
  const error = params.get("error");

  if (error) {
   alert("Google login failed");
   return;
  }

  if (token && userParam) {
   try {
    const userData = JSON.parse(
     decodeURIComponent(userParam)
    );

    login(userData, token);

    window.history.replaceState(
     {},
     document.title,
     "/login"
    );

    if (userData.role === "admin") {
     navigate("/admin");
    } else {
     navigate("/products");
    }
   } catch (error) {
    alert("Google login processing failed");
   }
  }
 }, []);

 const handleGoogleLogin = () => {
  window.location.href =
   `${import.meta.env.VITE_API_URL}/auth/google`;
 };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
   setLoading(true);

   const res = await API.post(
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

   if (res.data.user.role === "admin") {
    navigate("/admin");
   } else {
    navigate("/products");
   }
  } catch (error) {
   alert(
    error.response?.data?.message ||
    "Login Failed"
   );
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="auth-page">
   <div className="auth-card">
    <h1>Welcome Back</h1>

    <p className="auth-subtitle">
     Login to Sasikumar Electronics
    </p>

    <button
     type="button"
     className="google-btn"
     onClick={handleGoogleLogin}
    >
     Continue with Google
    </button>

    <div className="or-line">
     <span>or</span>
    </div>

    <form onSubmit={handleSubmit}>
     <input
      type="email"
      placeholder="Email Address"
      required
      value={email}
      onChange={(e) =>
       setEmail(e.target.value)
      }
     />

     <input
      type="password"
      placeholder="Password"
      required
      value={password}
      onChange={(e) =>
       setPassword(e.target.value)
      }
     />

     <button disabled={loading}>
      {
       loading
       ?
       "Logging in..."
       :
       "Login"
      }
     </button>
    </form>

    <p className="switch-text">
     New customer?
     <Link to="/register">
      Create Account
     </Link>
    </p>
   </div>
  </div>
 );
};

export default Login;