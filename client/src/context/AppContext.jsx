import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// ----------------- AXIOS DEFAULTS -----------------
// These settings make axios include cookies with requests and set the base backend URL
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// ----------------- CREATE CONTEXT -----------------
export const AppContext = createContext();

// ----------------- APP CONTEXT PROVIDER -----------------
export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate(); // For programmatic navigation
  const currency = import.meta.env.VITE_CURRENCY || "₹"; // Default currency symbol

  // ----------------- STATES -----------------
  const [user, setUser] = useState(null); // Logged-in user info
  const [isSeller, setIsSeller] = useState(false); // Seller auth status
  const [authLoading, setAuthLoading] = useState(true); // Loading state during initial auth fetch
  const [showUserLogin, setShowUserLogin] = useState(false); // Whether login modal should show
  const [products, setProducts] = useState([]); // List of products from backend
  const [cartItems, setCartItems] = useState({}); // Cart items as { productId: quantity }
  const [searchQuery, setSearchQuery] = useState(""); // Search term for products

  // ----------------- FETCH SELLER AUTH STATUS -----------------
 // Fetch seller auth status
const fetchSeller = async () => {
  try {
    const { data } = await axios.get("/api/seller/is-auth", { withCredentials: true });
    setIsSeller(data.success || false);
  } catch {
    setIsSeller(false);
  }
};


  // ----------------- FETCH USER AUTH STATUS -----------------
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth",{ withCredentials: true }); // Check if user is logged in
      if (data.success) {
        setUser(data.user || null); // Set user info
        setCartItems(data.user?.cartItems || {}); // Initialize cart from user data
      } else {
        setUser(null); // Not logged in
      }
    } catch {
      setUser(null); // On error, reset user
    }
  };

  // ----------------- FETCH PRODUCTS -----------------
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list"); // Get product list from backend
      if (data.success) setProducts(data.products || []); // Save products in state
      else toast.error(data.message || "Failed to fetch products"); // Show error message
    } catch (error) {
      toast.error(error.response?.data?.message || error.message); // Show axios error
    }
  };

  // ----------------- CART FUNCTIONS -----------------

  // Add a product to cart (or increase quantity if already exists)
  const addToCart = async (itemId, quantity = 1) => {
    try {
      const updatedCart = { ...cartItems };
      updatedCart[itemId] = (updatedCart[itemId] || 0) + quantity; // Add quantity
      setCartItems(updatedCart); // Update state

      // If user is logged in, update cart in backend
      if (user?._id) {
        await axios.post("/api/cart/update", {
          userId: user._id,
          cartItems: updatedCart,
        });
      }

      toast.success("Added to Cart"); // Show success message
    } catch (error) {
      toast.error(error.response?.data?.message || error.message); // Show error
    }
  };

  // Update cart item quantity (or remove if quantity = 0)
  const updateCartItem = async (itemId, quantity) => {
    try {
      const updatedCart = { ...cartItems };
      if (quantity > 0) updatedCart[itemId] = quantity; // Update quantity
      else delete updatedCart[itemId]; // Remove item if quantity = 0

      setCartItems(updatedCart);

      // Update backend if logged in
      if (user?._id) {
        await axios.post("/api/cart/update", {
          userId: user._id,
          cartItems: updatedCart,
        });
      }

      toast.success("Cart Updated"); // Success message
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Remove item completely from cart
  const removeFromCart = async (itemId) => {
    try {
      const updatedCart = { ...cartItems };
      if (updatedCart[itemId]) {
        delete updatedCart[itemId]; // Remove item from cart state
        setCartItems(updatedCart);

        if (user?._id) {
          await axios.post("/api/cart/update", {
            userId: user._id,
            cartItems: updatedCart,
          });
        }

        toast.success("Removed from Cart");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Get total number of items in cart
  const getCartCount = () =>
    Object.values(cartItems).reduce((a, b) => a + b, 0);

  // Get total cart amount in selected currency
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (product) totalAmount += product.offerPrice * cartItems[id];
    }
    return Number(totalAmount.toFixed(2));
  };

  // ----------------- INITIAL DATA FETCH -----------------
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchSeller(), fetchUser(), fetchProducts()]); // Fetch seller, user, and products
      setAuthLoading(false); // Done loading
    };
    init();
  }, []);

  // ----------------- CONTEXT VALUE -----------------
  const value = {
    navigate,           // React Router navigation
    user,               // Logged-in user object
    setUser,            // Function to update user
    isSeller,           // Is logged in user a seller?
    setIsSeller,        // Update seller status
    authLoading,        // Loading flag for auth
    showUserLogin,      // Show login modal
    setShowUserLogin,   // Toggle login modal
    products,           // List of products
    setProducts,        // Update products list
    currency,           // Currency symbol
    cartItems,          // Cart items object
    setCartItems,       // Update cart items
    addToCart,          // Add item to cart
    updateCartItem,     // Update cart item quantity
    removeFromCart,     // Remove item from cart
    getCartCount,       // Get total items count
    getCartAmount,      // Get total cart amount
    searchQuery,        // Search term
    setSearchQuery,     // Update search term
    axios,              // Axios instance with defaults
    fetchProducts,      // Refetch products from backend
    fetchUser,          // Refetch user from backend
    fetchSeller,        // Refetch seller auth
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ----------------- CUSTOM HOOK FOR EASY USAGE -----------------
export const useAppContext = () => useContext(AppContext);
