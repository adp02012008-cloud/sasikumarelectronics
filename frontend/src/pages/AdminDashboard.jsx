import {
  useEffect,
  useState,
} from "react";

import axios from "../api/axios";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {

 const [dashboard,setDashboard] = useState({});
 const [sales,setSales] = useState({});
 const [lowStock,setLowStock] = useState([]);
 const [monthly,setMonthly] = useState({});
 const [revenueChart,setRevenueChart] = useState([]);
 const [topProducts,setTopProducts] = useState([]);
 const [users,setUsers] = useState([]);

 useEffect(()=>{
  fetchAnalytics();
 },[]);

 const fetchAnalytics =
 async()=>{

  try{

   const token =
   localStorage.getItem("token");

   const config = {
    headers:{
     Authorization:`Bearer ${token}`
    }
   };

   const dashboardRes =
   await axios.get("/admin/dashboard",config);

   const salesRes =
   await axios.get("/admin/sales-stats",config);

   const stockRes =
   await axios.get("/admin/low-stock",config);

   const monthlyRes =
   await axios.get("/admin/monthly-revenue",config);

   const revenueRes =
   await axios.get("/admin/revenue-chart",config);

   const productRes =
   await axios.get("/admin/top-products",config);

   const userRes =
   await axios.get("/admin/user-growth",config);

   setDashboard(dashboardRes.data);
   setSales(salesRes.data);
   setLowStock(stockRes.data.products || []);
   setMonthly(monthlyRes.data.monthly || {});
   setRevenueChart(revenueRes.data.chart || []);
   setTopProducts(productRes.data.products || []);
   setUsers(userRes.data.users || []);

  }
  catch(error){
   console.log(error);
  }

 };

 const pieData = [
  {
   name:"Orders",
   value:sales.totalOrders || 0
  },
  {
   name:"Products",
   value:dashboard.products || 0
  },
  {
   name:"Users",
   value:dashboard.users || 0
  }
 ];

 return(

  <div
   style={{
    padding:"20px"
   }}
  >

   <h1>
    Admin Analytics Dashboard
   </h1>

   <hr/>

   <h2>
    Overall
   </h2>

   <p>Users : {dashboard.users || 0}</p>
   <p>Products : {dashboard.products || 0}</p>
   <p>Orders : {dashboard.orders || 0}</p>
   <p>Revenue : ₹{dashboard.revenue || 0}</p>

   <hr/>

   <h2>
    Sales
   </h2>

   <p>Total Orders : {sales.totalOrders || 0}</p>
   <p>Total Sales : ₹{sales.totalSales || 0}</p>

   <hr/>

   <h2>
    Revenue Line Chart
   </h2>

   <div
    style={{
     width:"100%",
     height:"300px"
    }}
   >

    <ResponsiveContainer>

     <LineChart data={revenueChart}>

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="_id" />

      <YAxis />

      <Tooltip />

      <Line
       type="monotone"
       dataKey="revenue"
      />

     </LineChart>

    </ResponsiveContainer>

   </div>

   <hr/>

   <h2>
    User Growth Bar Chart
   </h2>

   <div
    style={{
     width:"100%",
     height:"300px"
    }}
   >

    <ResponsiveContainer>

     <BarChart data={users}>

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="_id" />

      <YAxis />

      <Tooltip />

      <Bar dataKey="totalUsers" />

     </BarChart>

    </ResponsiveContainer>

   </div>

   <hr/>

   <h2>
    Store Summary Pie Chart
   </h2>

   <div
    style={{
     width:"100%",
     height:"300px"
    }}
   >

    <ResponsiveContainer>

     <PieChart>

      <Pie
       data={pieData}
       dataKey="value"
       nameKey="name"
       outerRadius={100}
       label
      >

       {
        pieData.map(
         (entry,index)=>(
          <Cell
           key={index}
          />
         )
        )
       }

      </Pie>

      <Tooltip />

     </PieChart>

    </ResponsiveContainer>

   </div>

   <hr/>

   <h2>
    Low Stock Products
   </h2>

   {
    lowStock.length === 0
    ? (
     <p>No Low Stock Products</p>
    )
    : (
     lowStock.map(
      product=>(
       <p key={product._id}>
        {product.name}
        {" - "}
        Stock : {product.stock}
       </p>
      )
     )
    )
   }

   <hr/>

   <h2>
    Monthly Revenue
   </h2>

   {
    Object.entries(monthly).map(
     ([month,value])=>(
      <p key={month}>
       {month} : ₹{value}
      </p>
     )
    )
   }

   <hr/>

   <h2>
    Top Products
   </h2>

   {
    topProducts.length === 0
    ? (
     <p>No Sales Data</p>
    )
    : (
     topProducts.map(
      item=>(
       <p key={item._id}>
        Product: {item._id}
        <br/>
        Sold: {item.totalSold}
       </p>
      )
     )
    )
   }

  </div>

 );

};

export default AdminDashboard;