import {
 useEffect,
 useState,
} from "react";


import API from "../api/axios";



const AdminUsers = () => {


 const [
  users,
  setUsers
 ] =
 useState([]);






 useEffect(()=>{


  fetchUsers();


 },[]);







 const fetchUsers =
 async()=>{


  try{


   const token =
   localStorage.getItem(
    "token"
   );




   const res =
   await API.get(

    "/admin/users",

    {

     headers:{


      Authorization:
      `Bearer ${token}`


     }


    }

   );





   setUsers(

    res.data.users
    ||
    []

   );




  }
  catch(error){



   console.log(
    error
   );



  }



 };









 const deleteUser =
 async(id)=>{


  if(
   !window.confirm(
    "Delete this user?"
   )
  )
  return;





  try{


   const token =
   localStorage.getItem(
    "token"
   );





   await API.delete(

    `/admin/user/${id}`,

    {

     headers:{


      Authorization:
      `Bearer ${token}`


     }


    }


   );





   fetchUsers();





  }
  catch(error){



   alert(
    "Delete Failed"
   );



   console.log(
    error
   );



  }



 };









 return(


 <div className="admin-users">



  <h1>

   User Management

  </h1>






  <div className="table-box">



   <table>



    <thead>


     <tr>


      <th>

       Name

      </th>



      <th>

       Email

      </th>




      <th>

       Role

      </th>




      <th>

       Action

      </th>



     </tr>


    </thead>








    <tbody>



    {


     users.map(

      user=>(




      <tr

       key={
        user._id
       }

      >




       <td>


        {
         user.name
        }


       </td>






       <td>


        {
         user.email
        }


       </td>







       <td>


        <span className="role-badge">


         {
          user.role
         }


        </span>


       </td>








       <td>



        <button

         className="delete-btn"

         onClick={
          ()=>

          deleteUser(

           user._id

          )

         }

        >


         Delete


        </button>




       </td>






      </tr>




      )

     )


    }




    </tbody>




   </table>



  </div>





 </div>


 );


};




export default AdminUsers;