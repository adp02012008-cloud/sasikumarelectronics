import {
 useEffect,
 useState,
} from "react";


import API from "../api/axios";


import {
 LineChart,
 Line,
 BarChart,
 Bar,
 PieChart,
 Pie,
 XAxis,
 YAxis,
 Tooltip,
 CartesianGrid,
 ResponsiveContainer,
} from "recharts";



const AdminDashboard = () => {


 const [dashboard,setDashboard] =
 useState({});


 const [sales,setSales] =
 useState({});


 const [lowStock,setLowStock] =
 useState([]);


 const [revenueChart,setRevenueChart] =
 useState([]);


 const [users,setUsers] =
 useState([]);



 useEffect(()=>{

  fetchAnalytics();

 },[]);





 const fetchAnalytics =
 async()=>{


  try{


   const token =
   localStorage.getItem(
    "token"
   );


   const config={

    headers:{

     Authorization:
     `Bearer ${token}`

    }

   };




   const dashboardRes =
   await API.get(
    "/admin/dashboard",
    config
   );


   const salesRes =
   await API.get(
    "/admin/sales-stats",
    config
   );


   const stockRes =
   await API.get(
    "/admin/low-stock",
    config
   );


   const revenueRes =
   await API.get(
    "/admin/revenue-chart",
    config
   );


   const userRes =
   await API.get(
    "/admin/user-growth",
    config
   );





   setDashboard(
    dashboardRes.data
   );


   setSales(
    salesRes.data
   );


   setLowStock(
    stockRes.data.products || []
   );


   setRevenueChart(
    revenueRes.data.chart || []
   );


   setUsers(
    userRes.data.users || []
   );



  }
  catch(error){


   console.log(error);


  }


 };






 return(


 <div className="admin-page">



  <h1>
   Admin Dashboard
  </h1>




  <div className="stats-grid">



   <div className="stat-card">

    <h3>Users</h3>

    <h2>
     {dashboard.users || 0}
    </h2>

   </div>




   <div className="stat-card">

    <h3>Products</h3>

    <h2>
     {dashboard.products || 0}
    </h2>

   </div>




   <div className="stat-card">

    <h3>Orders</h3>

    <h2>
     {dashboard.orders || 0}
    </h2>

   </div>





   <div className="stat-card">

    <h3>Revenue</h3>

    <h2>
     ₹{dashboard.revenue || 0}
    </h2>

   </div>



  </div>








  <div className="chart-box">


   <h2>
    Revenue Analytics
   </h2>


   <ResponsiveContainer
    width="100%"
    height={300}
   >


    <LineChart
     data={revenueChart}
    >


     <CartesianGrid
      strokeDasharray="3 3"
     />


     <XAxis
      dataKey="_id"
     />


     <YAxis />


     <Tooltip />


     <Line
      dataKey="revenue"
     />


    </LineChart>


   </ResponsiveContainer>



  </div>









  <div className="chart-box">


   <h2>
    User Growth
   </h2>


   <ResponsiveContainer
    width="100%"
    height={300}
   >


    <BarChart
     data={users}
    >


     <CartesianGrid
      strokeDasharray="3 3"
     />


     <XAxis
      dataKey="_id"
     />


     <YAxis/>


     <Tooltip/>


     <Bar
      dataKey="totalUsers"
     />


    </BarChart>



   </ResponsiveContainer>



  </div>










  <div className="chart-box">


   <h2>

    Low Stock Products

   </h2>




   {

    lowStock.length===0

    ?

    <p>

     No low stock products

    </p>

    :

    lowStock.map(

     item=>(


      <p key={item._id}>


       {item.name}


       {" - Stock : "}


       {item.stock}


      </p>


     )

    )

   }



  </div>






 </div>


 );


};




export default AdminDashboard;