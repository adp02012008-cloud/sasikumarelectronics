import { useEffect, useState } from "react";
import API from "../api/axios";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
    minPrice: "",
    maxPrice: "",
    dynamicPricing: false,
    demand: "",
  });

  const [images, setImages] = useState([]);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
    minPrice: "",
    maxPrice: "",
    dynamicPricing: false,
    demand: "",
  });
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [editNewImages, setEditNewImages] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data.products || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 5) {
      alert("You can upload maximum 5 images only");
      e.target.value = "";
      setImages([]);
      return;
    }

    setImages(selectedFiles);
  };

  const addProduct = async (e) => {
    e.preventDefault();

    if (images.length < 1) {
      alert("Please upload at least 1 product image");
      return;
    }

    if (images.length > 5) {
      alert("You can upload maximum 5 images only");
      return;
    }

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }

      await API.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product Added Successfully");

      setForm({
        name: "",
        description: "",
        category: "",
        brand: "",
        price: "",
        stock: "",
        minPrice: "",
        maxPrice: "",
        dynamicPricing: false,
        demand: "",
      });

      setImages([]);

      const fileInput = document.getElementById("product-images");
      if (fileInput) {
        fileInput.value = "";
      }

      fetchProducts();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Product Add Failed");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.log(error);
      alert("Delete Failed");
    }
  };

  // Start Editing Product
  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      brand: product.brand || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      minPrice: product.minPrice ?? "",
      maxPrice: product.maxPrice ?? "",
      dynamicPricing: Boolean(product.dynamicPricing),
      demand: product.demand ?? "",
    });
    setEditExistingImages(product.images || []);
    setEditNewImages([]);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setEditExistingImages((prev) =>
      prev.filter((_, idx) => idx !== indexToRemove)
    );
  };

  const handleEditNewImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxAllowed = 5 - (editExistingImages.length + editNewImages.length);

    if (selectedFiles.length > maxAllowed) {
      alert(`You can only have up to 5 images total. You can only select ${maxAllowed} more image(s).`);
      e.target.value = "";
      return;
    }

    setEditNewImages((prev) => [...prev, ...selectedFiles]);
    e.target.value = "";
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setEditNewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    const totalImages = editExistingImages.length + editNewImages.length;
    if (totalImages < 1) {
      alert("Product must have at least 1 image. Please retain an existing image or upload a new one.");
      return;
    }

    if (totalImages > 5) {
      alert("You can have a maximum of 5 images only.");
      return;
    }

    setIsUpdating(true);

    try {
      const formData = new FormData();

      Object.keys(editForm).forEach((key) => {
        formData.append(key, editForm[key]);
      });

      // Pass existing retained images
      formData.append("existingImages", JSON.stringify(editExistingImages));

      // Append new image files
      for (let i = 0; i < editNewImages.length; i++) {
        formData.append("images", editNewImages[i]);
      }

      await API.put(`/products/${editingProduct._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product Updated Successfully!");
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update product");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="admin-products">
      <h1>Product Management</h1>

      <div className="admin-form-box">
        <h2>Add New Product</h2>

        <p className="admin-form-note">
          Upload 1 to 5 product images. These images will appear
          in the product detail gallery.
        </p>

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
            placeholder="Product Description"
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
            id="product-images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          <small className="image-note">
            Selected images: {images.length} / 5
          </small>

          <button type="submit">
            Add Product
          </button>
        </form>
      </div>

      <div className="table-box">
        <div className="admin-table-toolbar">
          <div>
            <h2>Products List ({filteredProducts.length})</h2>
            <p className="admin-form-note" style={{ margin: "4px 0 0" }}>
              Manage your catalogue, edit specifications, update pricing, or remove products.
            </p>
          </div>
          <div className="admin-search-wrapper">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by name, category, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Images</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "35px", color: "#64748b" }}>
                  {searchQuery ? "No products found matching your search." : "No products available."}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      className="admin-img"
                      src={
                        product.images?.[0]?.url ||
                        "/favicon.svg"
                      }
                      alt={product.name}
                    />
                  </td>

                  <td style={{ fontWeight: 600 }}>{product.name}</td>

                  <td>{product.category}</td>

                  <td>{product.brand || "—"}</td>

                  <td>
                    {product.images?.length || 0}
                  </td>

                  <td>₹{product.price}</td>

                  <td>
                    <span className={product.stock <= 5 ? "stock-badge-low" : ""}>
                      {product.stock}
                    </span>
                  </td>

                  <td>
                    ⭐ {product.ratings || 0}
                  </td>

                  <td>
                    <div className="product-actions-cell">
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleStartEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          deleteProduct(
                            product._id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div
          className="order-modal-bg"
          onClick={() => !isUpdating && setEditingProduct(null)}
        >
          <div
            className="order-modal edit-product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>Edit Product</h2>
                <p>Editing &ldquo;{editingProduct.name}&rdquo; (ID: {editingProduct._id})</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !isUpdating && setEditingProduct(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="edit-product-form">
              <div className="edit-form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    name="name"
                    placeholder="Product Name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Brand</label>
                  <input
                    name="brand"
                    placeholder="Brand"
                    value={editForm.brand}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <input
                    name="category"
                    placeholder="Category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    name="price"
                    type="number"
                    step="any"
                    placeholder="Price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    name="stock"
                    type="number"
                    placeholder="Stock"
                    value={editForm.stock}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Demand</label>
                  <input
                    name="demand"
                    type="number"
                    placeholder="Demand"
                    value={editForm.demand}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Price (₹)</label>
                  <input
                    name="minPrice"
                    type="number"
                    step="any"
                    placeholder="Minimum Price"
                    value={editForm.minPrice}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Price (₹)</label>
                  <input
                    name="maxPrice"
                    type="number"
                    step="any"
                    placeholder="Maximum Price"
                    value={editForm.maxPrice}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label>Product Description *</label>
                  <textarea
                    name="description"
                    placeholder="Product Description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    required
                    rows={4}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="dynamicPricing"
                      checked={editForm.dynamicPricing}
                      onChange={handleEditChange}
                    />
                    Enable Dynamic Pricing
                  </label>
                </div>
              </div>

              {/* Media management section */}
              <div className="edit-media-section">
                <div className="edit-media-header">
                  <h3>Product Images</h3>
                  <span className="media-counter-badge">
                    {editExistingImages.length + editNewImages.length} / 5 Images
                  </span>
                </div>
                <p className="admin-form-note" style={{ margin: "2px 0 12px" }}>
                  Manage current images or upload new ones. At least 1 image is required (maximum 5).
                </p>

                {/* Existing Images */}
                {editExistingImages.length > 0 && (
                  <div className="image-preview-block">
                    <span className="preview-label">Saved Images:</span>
                    <div className="image-thumbnails-grid">
                      {editExistingImages.map((img, idx) => (
                        <div key={img._id || img.url || idx} className="image-thumbnail-item">
                          <img src={img.url} alt={`Saved ${idx + 1}`} />
                          <button
                            type="button"
                            className="thumbnail-delete-btn"
                            title="Remove image"
                            onClick={() => handleRemoveExistingImage(idx)}
                          >
                            ✕
                          </button>
                          <span className="thumbnail-badge">#{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Images Picker */}
                {editExistingImages.length + editNewImages.length < 5 && (
                  <div className="upload-new-block">
                    <label className="upload-new-label" htmlFor="edit-upload-input">
                      Add New Images (up to {5 - (editExistingImages.length + editNewImages.length)} more)
                    </label>
                    <input
                      id="edit-upload-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleEditNewImageChange}
                    />
                  </div>
                )}

                {/* Newly Picked Images */}
                {editNewImages.length > 0 && (
                  <div className="image-preview-block" style={{ marginTop: "14px" }}>
                    <span className="preview-label">Newly Selected to Upload:</span>
                    <div className="image-thumbnails-grid">
                      {editNewImages.map((file, idx) => (
                        <div key={idx} className="image-thumbnail-item is-new">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${idx + 1}`}
                          />
                          <button
                            type="button"
                            className="thumbnail-delete-btn"
                            title="Remove new image"
                            onClick={() => handleRemoveNewImage(idx)}
                          >
                            ✕
                          </button>
                          <span className="thumbnail-badge new-tag">New</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="edit-modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingProduct(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;