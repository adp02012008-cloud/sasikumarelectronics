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
 const [googleLoading, setGoogleLoading] = useState(false);

 useEffect(() => {
  // Silent health check to pre-warm backend on Render if sleeping
  API.get("/health").catch(() => {});

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

 const handleGoogleLogin = async () => {
  setGoogleLoading(true);
  try {
   // Wait for backend health check so Render wakes up seamlessly before redirect
   await API.get("/health", { timeout: 60000 });
  } catch (err) {
   console.error("Backend pre-warm ping error:", err);
  } finally {
   window.location.href =
    `${import.meta.env.VITE_API_URL}/auth/google`;
  }
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
     disabled={googleLoading || loading}
    >
     {googleLoading ? (
      <span className="google-btn-content">
       <span className="btn-spinner"></span>
       <span>Connecting to Google...</span>
      </span>
     ) : (
      <span className="google-btn-content">
       <svg className="google-icon" viewBox="0 0 24 24">
        <path
         fill="#4285F4"
         d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
         fill="#34A853"
         d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
         fill="#FBBC05"
         d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
         fill="#EA4335"
         d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
       </svg>
       <span>Continue with Google</span>
      </span>
     )}
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