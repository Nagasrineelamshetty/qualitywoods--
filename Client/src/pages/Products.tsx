// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Filter, Grid, List, Search } from "lucide-react";
// import axios from "../api/axios";
// import { Button } from "../components/ui/button";
// import { Card } from "../components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../components/ui/select";
// const API_BASE = import.meta.env.VITE_API_URL;

// type Product = {
//   _id: string;
//   name: string;
//   description: string;
//   price: number;
//   image: string;
//   category: string;
//   isInStock: boolean;
// };

// const Products = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [sortBy, setSortBy] = useState("name");

//   // Fetch real products
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await axios.get("/api/products");
//         setProducts(res.data);
//       } catch (err) {
//         console.error("Failed to fetch products");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

//   const categories = [
//     "all",
//     ...Array.from(new Set(products.map((p) => p.category))),
//   ];

//   const filteredProducts = products
//     .filter(
//       (product) =>
//         (selectedCategory === "all" ||
//           product.category === selectedCategory) &&
//         product.name.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === "price-low") return a.price - b.price;
//       if (sortBy === "price-high") return b.price - a.price;
//       return a.name.localeCompare(b.name);
//     });

//   if (loading) {
//     return <p className="p-6">Loading products...</p>;
//   }

//   return (
//     <div className="min-h-screen bg-stone-50 py-8">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-amber-900 mb-2">
//             Our Products
//           </h1>
//           <p className="text-stone-600">
//             Discover our furniture
//           </p>
//         </div>

//         {/* Filters */}
//         <div className="bg-white p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-center">
//           <div className="relative">
//             <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
//             <input
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search products"
//               className="pl-9 pr-3 py-2 border rounded"
//             />
//           </div>

//           <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//             <SelectTrigger className="w-40">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {categories.map((c) => (
//                 <SelectItem key={c} value={c}>
//                   {c === "all" ? "All Categories" : c}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={sortBy} onValueChange={setSortBy}>
//             <SelectTrigger className="w-40">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="name">Name</SelectItem>
//               <SelectItem value="price-low">Price: Low → High</SelectItem>
//               <SelectItem value="price-high">Price: High → Low</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <p className="mb-4 text-stone-600">
//           Showing {filteredProducts.length} of {products.length} products
//         </p>

//         {/* Products */}
//         <div
//           className={
//             viewMode === "grid"
//               ? "grid grid-cols-1 md:grid-cols-3 gap-6"
//               : "space-y-4"
//           }
//         >
//           {filteredProducts.map((product) => (
//             <Card key={product._id} className="p-4 bg-white">
//               <img
//                 src={`${API_BASE}${product.image}`}
//                 alt={product.name}
//                 onError={(e) => {
//                   console.log("IMAGE FAILED:", `${API_BASE}${product.image}`);
//                 }}
//                 className="h-48 w-full object-cover rounded mb-3"
//               />

//               <h3 className="font-semibold text-lg">{product.name}</h3>
//               <p>{product.category}</p>   
//               <p className="font-bold text-amber-600 mb-3">
//                 ₹{product.price.toLocaleString()}
//               </p>

//               <Link to={`/products/${product._id}`}>
//                 <Button
//                   className="w-full bg-amber-600 hover:bg-amber-700"
//                   disabled={!product.isInStock}
//                 >
//                   {product.isInStock ? "View Details" : "Out of Stock"}
//                 </Button>
//               </Link>
//             </Card>
//           ))}
//         </div>

//         {filteredProducts.length === 0 && (
//           <div className="text-center py-10">
//             <Filter className="mx-auto mb-3 text-stone-400" size={40} />
//             <p>No products found</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Products;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import axios from "../api/axios";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const API_BASE = import.meta.env.VITE_API_URL;

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isInStock: boolean;
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(res.data);
      } catch {
        console.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = products
    .filter(
      (product) =>
        (selectedCategory === "all" ||
          product.category === selectedCategory) &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  if (loading) {
    return <p className="p-6">Loading products...</p>;
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            Our Products
          </h1>
          <p className="text-stone-600">
            Discover our handcrafted furniture
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products"
              className="pl-9 pr-3 py-2 border rounded-md"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price-low">
                Price: Low → High
              </SelectItem>
              <SelectItem value="price-high">
                Price: High → Low
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-stone-600">
          Showing {filteredProducts.length} of {products.length} products
        </p>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product._id}
              className="bg-white overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              {/* Image */}
              <img
                src={`${API_BASE}${product.image}`}
                alt={product.name}
                className="w-full h-60 md:h-64 object-cover"
              />

              {/* Content */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="font-semibold text-lg text-amber-900 min-h-[3.2rem] leading-tight line-clamp-2">
                  {product.name}
                </h3>

                {/* Category */}
                <p className="text-sm text-stone-600 min-h-[1.25rem]">
                  {product.category}
                </p>

                {/* Price */}
                <p className="font-bold text-amber-600 h-[1.75rem] flex items-center">
                  ₹{product.price.toLocaleString()}
                </p>

                {/* Button */}
                <div className="mt-auto pt-3">
                  <Link to={`/products/${product._id}`}>
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      disabled={!product.isInStock}
                    >
                      {product.isInStock
                        ? "View Details"
                        : "Out of Stock"}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Filter
              className="mx-auto mb-3 text-stone-400"
              size={40}
            />
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
