import {
 useState,
} from "react";

import {
 Link,
 useNavigate,
} from "react-router-dom";

import API from "../api/axios";

const Register = () => {
 const navigate = useNavigate();

 const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
 });

 const [loading, setLoading] = useState(false);

 const handleGoogleSignup = () => {
  window.location.href =
   `${import.meta.env.VITE_API_URL}/auth/google`;
 };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
   setLoading(true);

   await API.post(
    "/auth/register",
    form
   );

   alert("Account Created Successfully");

   navigate("/login");
  } catch (error) {
   alert(
    error.response?.data?.message ||
    "Registration Failed"
   );
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="auth-page">
   <div className="auth-card">
    <h1>Create Account</h1>

    <p className="auth-subtitle">
     Join Sasikumar Electronics
    </p>

    <button
     type="button"
     className="google-btn"
     onClick={handleGoogleSignup}
    >
     Continue with Google
    </button>

    <div className="or-line">
     <span>or</span>
    </div>

    <form onSubmit={handleSubmit}>
     <input
      type="text"
      placeholder="Full Name"
      required
      value={form.name}
      onChange={(e) =>
       setForm({
        ...form,
        name: e.target.value,
       })
      }
     />

     <input
      type="email"
      placeholder="Email Address"
      required
      value={form.email}
      onChange={(e) =>
       setForm({
        ...form,
        email: e.target.value,
       })
      }
     />

     <input
      type="password"
      placeholder="Password"
      required
      value={form.password}
      onChange={(e) =>
       setForm({
        ...form,
        password: e.target.value,
       })
      }
     />

     <button disabled={loading}>
      {
       loading
       ?
       "Creating..."
       :
       "Create Account"
      }
     </button>
    </form>

    <p className="switch-text">
     Already have an account?
     <Link to="/login">
      Login
     </Link>
    </p>
   </div>
  </div>
 );
};

export default Register;