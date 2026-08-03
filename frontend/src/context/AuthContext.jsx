import {
 createContext,
 useState,
} from "react";



export const AuthContext =
createContext();





export const AuthProvider =
({children})=>{


 const getStoredUser =
 ()=>{


  try{


   return JSON.parse(

    localStorage.getItem(
     "user"
    )

   );


  }
  catch(error){


   return null;


  }


 };






 const [
  user,
  setUser
 ] =
 useState(
  getStoredUser()
 );






 const login =
 (
  userData,
  token
 )=>{



  localStorage.setItem(

   "token",

   token

  );





  localStorage.setItem(

   "user",

   JSON.stringify(
    userData
   )

  );




  setUser(
   userData
  );



 };







 const logout =
 ()=>{



  localStorage.removeItem(
   "token"
  );



  localStorage.removeItem(
   "user"
  );



  setUser(
   null
  );



 };







  const updateUser = (newUserData) => {
    const updated = { ...user, ...newUserData };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );



};