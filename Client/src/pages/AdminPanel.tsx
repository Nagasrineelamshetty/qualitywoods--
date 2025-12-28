// import {
//   Package,
//   TrendingUp,
//   Calendar,
//   Edit,
//   Trash2,
//   Plus,
// } from "lucide-react";
// import { useState, useEffect } from "react";
// import { Button } from "../components/ui/button";
// import { Card } from "../components/ui/card";
// import { useAuth } from "../contexts/AuthContext";
// import { toast } from "../hooks/use-toast";
// import AddProductModal from "../components/admin/AddProductModal";
// import axios from "../api/axios";
// import { useNavigate } from "react-router-dom";
// const API_BASE = import.meta.env.VITE_API_URL;

// const AdminPanel = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState<"dashboard" | "products">(
//     "dashboard"
//   );
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

//   // Orders (mock for dashboard stats)
//   const [stats, setStats] = useState({
//   totalOrders: 0,
//   totalRevenue: 0,
//   pendingOrders: 0,
//   totalProducts: 0,
// });


//   // Products
//   const [productList, setProductList] = useState<any[]>([]);
//   const [loadingProducts, setLoadingProducts] = useState(false);
//   useEffect(() => {
//   const fetchStats = async () => {
//     try {
//       const res = await axios.get("/api/admin/dashboard-stats");
//       setStats(res.data);
//     } catch {
//       toast({
//         title: "Error",
//         description: "Failed to load dashboard analytics",
//         variant: "destructive",
//       });
//     }
//   };

//   fetchStats();
// }, []);

//   // Fetch products
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoadingProducts(true);
//         const res = await axios.get("/api/admin/products");
//         setProductList(res.data);
//       } catch {
//         toast({
//           title: "Error",
//           description: "Failed to load products",
//           variant: "destructive",
//         });
//       } finally {
//         setLoadingProducts(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   if (!user) {
//     return <div className="p-6">Loading admin dashboard...</div>;
//   }

//   // Delete product
//   const handleDeleteProduct = async (productId: string) => {
//     try {
//       await axios.delete(`/api/admin/products/${productId}`);
//       setProductList((prev) =>
//         prev.filter((product) => product._id !== productId)
//       );

//       toast({
//         title: "Product deleted",
//         description: "Product removed successfully",
//       });
//     } catch {
//       toast({
//         title: "Error",
//         description: "Failed to delete product",
//         variant: "destructive",
//       });
//     }
//   };

//   const StatCard = ({ title, value, icon: Icon, color }: any) => (
//     <Card className="p-6 bg-white">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-stone-600">{title}</p>
//           <p className={`text-2xl font-bold ${color}`}>{value}</p>
//         </div>
//         <Icon className={`w-8 h-8 ${color}`} />
//       </div>
//     </Card>
//   );

//   return (
//     <div className="min-h-screen bg-stone-50">
//       <div className="max-w-7xl mx-auto px-4 py-8">

//         {/* Header */}
//         <div className="mb-8 flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-amber-900">
//               Admin Dashboard
//             </h1>
//             <p className="text-stone-600 mt-1">
//               Welcome back, {user.name}
//             </p>
//           </div>

//           <Button
//             className="bg-amber-600 hover:bg-amber-700"
//             onClick={() => navigate("/admin/orders")}
//           >
//             Manage Orders
//           </Button>
//         </div>

//         {/* Tabs */}
//         <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
//           {["dashboard", "products"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab as any)}
//               className={`px-6 py-2 rounded-md text-sm font-medium ${
//                 activeTab === tab
//                   ? "bg-amber-600 text-white"
//                   : "text-stone-600 hover:bg-amber-50"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Dashboard */}
//         {activeTab === "dashboard" && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <StatCard title="Total Orders" value={stats.totalOrders} icon={Package} color="text-blue-600" />
//             <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon={TrendingUp} color="text-green-600" />
//             <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="text-purple-600" />
//             <StatCard title="Pending Orders" value={stats.pendingOrders} icon={Calendar} color="text-orange-600" />
//           </div>
//         )}

//         {/* Products */}
//         {activeTab === "products" && (
//           <div className="space-y-6">
//             <div className="flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-amber-900">
//                 Product Management
//               </h2>
//               <Button
//                 className="bg-amber-600 hover:bg-amber-700"
//                 onClick={() => {
//                   setSelectedProduct(null);
//                   setShowAddModal(true);
//                 }}
//               >
//                 <Plus size={16} className="mr-2" />
//                 Add Product
//               </Button>
//             </div>

//             {loadingProducts ? (
//               <p>Loading products...</p>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {productList.map((product) => (
//                   <Card key={product._id} className="bg-white overflow-hidden">
//                     <img
//                       src={`${API_BASE}${product.image}`}
//                       alt={product.name}
//                       className="w-full h-48 object-cover"
//                     />

//                     <div className="p-4">
//                       <div className="flex justify-between items-start mb-2">
//                         <h3 className="font-semibold text-amber-900">
//                           {product.name}
//                         </h3>
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs ${
//                             product.isInStock
//                               ? "bg-green-100 text-green-800"
//                               : "bg-red-100 text-red-800"
//                           }`}
//                         >
//                           {product.isInStock ? "In Stock" : "Out of Stock"}
//                         </span>
//                       </div>

//                       <p className="text-sm text-stone-600">{product.category}</p>
//                       <p className="font-bold text-amber-600 mb-3">
//                         ₹{product.price.toLocaleString()}
//                       </p>

//                       <div className="flex justify-end gap-2">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => {
//                             setSelectedProduct(product);
//                             setShowAddModal(true);
//                           }}
//                         >
//                           <Edit size={16} />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleDeleteProduct(product._id)}
//                           className="text-red-600 hover:text-red-700"
//                         >
//                           <Trash2 size={16} />
//                         </Button>
//                       </div>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Add / Edit Modal */}
//         {showAddModal && (
//           <AddProductModal
//             product={selectedProduct}
//             onClose={() => {
//               setShowAddModal(false);
//               setSelectedProduct(null);
//             }}
//             onProductSaved={(updatedProduct) => {
//               setProductList((prev) =>
//                 prev.map((p) =>
//                   p._id === updatedProduct._id ? updatedProduct : p
//                 )
//               );
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminPanel;
import { Package, TrendingUp, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "../hooks/use-toast";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/admin/dashboard-stats");
        setStats(res.data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load dashboard analytics",
          variant: "destructive",
        });
      }
    };

    fetchStats();
  }, []);

  if (!user) {
    return <div className="p-6">Loading admin dashboard...</div>;
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">
              Admin Dashboard
            </h1>
            <p className="text-stone-600 mt-1">
              Welcome back, {user.name}
            </p>
          </div>

          {/* <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => navigate("/admin/orders")}
          >
            Manage Orders
          </Button> */}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={Package}
            color="text-blue-600"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue}`}
            icon={TrendingUp}
            color="text-green-600"
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            color="text-purple-600"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={Calendar}
            color="text-orange-600"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
