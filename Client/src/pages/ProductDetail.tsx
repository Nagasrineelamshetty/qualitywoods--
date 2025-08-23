import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../hooks/use-toast';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { products } from '../data/mockData';
import axios from '../api/axios';

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const navigate = useNavigate();
  const { addItem, setBuyNowItem } = useCart();

  const [wood, setWood] = useState('Teak');
  const [finish, setFinish] = useState('Matte');
  const [dimensions, setDimensions] = useState('6x3');
  const [isPaying, setIsPaying] = useState(false);

  if (!product) return <div>Product not found</div>;

  // Buy Now button handler
  const handleBuyNow = () => {
    const itemToBuy = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      customizations: { wood, finish, dimensions }
    };

    setBuyNowItem(itemToBuy);                 // Save in CartContext
    navigate('/checkout?mode=buy-now');       // Redirect to Checkout page
  };

  // Add to cart handler
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      customizations: { wood, finish, dimensions }
    });
    toast({ title: 'Added to cart!' });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <img src={product.image} alt={product.name} className="w-full md:w-1/2 rounded-lg" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4 text-amber-900">{product.name}</h1>
          <p className="text-stone-600 mb-4">{product.description}</p>
          <p className="text-xl font-semibold text-green-800 mb-6">₹{product.price.toLocaleString()}</p>

          {/* Customization Options */}
          <div className="mb-4">
            <label className="block mb-1">Wood Type</label>
            <select value={wood} onChange={(e) => setWood(e.target.value)} className="w-full px-4 py-2 border rounded">
              <option value="Teak">Teak</option>
              <option value="Sheesham">Sheesham</option>
              <option value="Oak">Oak</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Finish</label>
            <select value={finish} onChange={(e) => setFinish(e.target.value)} className="w-full px-4 py-2 border rounded">
              <option value="Matte">Matte</option>
              <option value="Glossy">Glossy</option>
              <option value="Natural">Natural</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block mb-1">Dimensions</label>
            <select value={dimensions} onChange={(e) => setDimensions(e.target.value)} className="w-full px-4 py-2 border rounded">
              <option value="6x3">6x3</option>
              <option value="5x2.5">5x2.5</option>
              <option value="4x2">4x2</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleAddToCart} className="bg-stone-700 hover:bg-stone-800">
              Add to Cart
            </Button>

            <Button onClick={handleBuyNow} disabled={isPaying} className="bg-amber-600 hover:bg-amber-700">
              {isPaying ? 'Processing...' : 'Buy Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
