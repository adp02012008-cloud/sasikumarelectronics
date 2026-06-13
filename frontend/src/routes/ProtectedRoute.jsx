import {
 Navigate,
} from "react-router-dom";


import {
 useContext,
} from "react";


import {
 AuthContext,
} from "../context/AuthContext";




const ProtectedRoute =
({
 children,
 admin = false,
})=>{


 const {

  user,

  isAuthenticated,

  isAdmin,

 } =
 useContext(
  AuthContext
 );





 if(
  !isAuthenticated
 ){


  return (

   <Navigate

    to="/login"

   />

  );


 }







 if(
  admin &&
  !isAdmin
 ){


  return (

   <Navigate

    to="/"

   />

  );


 }






 return children;


};



export default ProtectedRoute;