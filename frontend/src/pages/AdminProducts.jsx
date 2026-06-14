import {
 useEffect,
 useState,
} from "react";

import API from "../api/axios";


const AdminProducts = () => {

 const [products,setProducts] =
 useState([]);

 const [form,setForm] =
 useState({
  name:"",
  description:"",
  category:"",
  brand:"",
  price:"",
  stock:"",
  minPrice:"",
  maxPrice:"",
  dynamicPricing:false,
  demand:"",
 });

 const [images,setImages] =
 useState([]);


 useEffect(()=>{

  fetchProducts();

 },[]);


 const fetchProducts =
 async()=>{

  try{

   const res =
   await API.get(
    "/products"
   );

   setProducts(
    res.data.products || []
   );

  }
  catch(error){

   console.log(error);

  }

 };


 const handleChange =
 (e)=>{

  const {name,value,type,checked} =
  e.target;

  setForm({
   ...form,
   [name]:
   type === "checkbox"
   ? checked
   : value
  });

 };


 const handleImageChange =
 (e)=>{

  setImages(
   e.target.files
  );

 };


 const addProduct =
 async(e)=>{

  e.preventDefault();

  try{

   const formData =
   new FormData();

   Object.keys(form).forEach(
    (key)=>{
     formData.append(
      key,
      form[key]
     );
    }
   );

   for(
    let i=0;
    i<images.length;
    i++
   ){
    formData.append(
     "images",
     images[i]
    );
   }

   await API.post(
    "/products",
    formData,
    {
     headers:{
      "Content-Type":
      "multipart/form-data"
     }
    }
   );

   alert(
    "Product Added Successfully"
   );

   setForm({
    name:"",
    description:"",
    category:"",
    brand:"",
    price:"",
    stock:"",
    minPrice:"",
    maxPrice:"",
    dynamicPricing:false,
    demand:"",
   });

   setImages([]);

   fetchProducts();

  }
  catch(error){

   console.log(error);

   alert(
    error.response?.data?.message ||
    "Product Add Failed"
   );

  }

 };


 const deleteProduct =
 async(id)=>{

  if(
   !window.confirm(
    "Delete this product?"
   )
  ){
   return;
  }

  try{

   await API.delete(
    `/products/${id}`
   );

   fetchProducts();

  }
  catch(error){

   console.log(error);

   alert(
    "Delete Failed"
   );

  }

 };


 return(

  <div className="admin-products">

   <h1>
    Product Management
   </h1>

   <div className="admin-form-box">

    <h2>
     Add New Product
    </h2>

    <form
     onSubmit={addProduct}
     className="product-form"
    >

     <input
      name="name"
      placeholder="Product Name"
      value={form.name}
      onChange={handleChange}
      required
     />

     <input
      name="brand"
      placeholder="Brand"
      value={form.brand}
      onChange={handleChange}
     />

     <input
      name="category"
      placeholder="Category"
      value={form.category}
      onChange={handleChange}
      required
     />

     <input
      name="price"
      type="number"
      placeholder="Price"
      value={form.price}
      onChange={handleChange}
      required
     />

     <input
      name="stock"
      type="number"
      placeholder="Stock"
      value={form.stock}
      onChange={handleChange}
      required
     />

     <input
      name="minPrice"
      type="number"
      placeholder="Minimum Price"
      value={form.minPrice}
      onChange={handleChange}
     />

     <input
      name="maxPrice"
      type="number"
      placeholder="Maximum Price"
      value={form.maxPrice}
      onChange={handleChange}
     />

     <input
      name="demand"
      type="number"
      placeholder="Demand"
      value={form.demand}
      onChange={handleChange}
     />

     <textarea
      name="description"
      placeholder="Description"
      value={form.description}
      onChange={handleChange}
      required
     />

     <label className="checkbox-label">
      <input
       type="checkbox"
       name="dynamicPricing"
       checked={form.dynamicPricing}
       onChange={handleChange}
      />
      Enable Dynamic Pricing
     </label>

     <input
      type="file"
      multiple
      onChange={handleImageChange}
     />

     <button type="submit">
      Add Product
     </button>

    </form>

   </div>

   <div className="table-box">

    <table>

     <thead>

      <tr>
       <th>Image</th>
       <th>Product</th>
       <th>Category</th>
       <th>Price</th>
       <th>Stock</th>
       <th>Action</th>
      </tr>

     </thead>

     <tbody>

      {
       products.map(
        product=>(

         <tr key={product._id}>

          <td>
           <img
            className="admin-img"
            src={
             product.images?.[0]?.url ||
             "/favicon.svg"
            }
           />
          </td>

          <td>
           {product.name}
          </td>

          <td>
           {product.category}
          </td>

          <td>
           ₹{product.price}
          </td>

          <td>
           {product.stock}
          </td>

          <td>
           <button
            className="delete-btn"
            onClick={()=>
             deleteProduct(
              product._id
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

export default AdminProducts;