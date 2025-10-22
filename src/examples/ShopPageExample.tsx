import React from 'react';
import { ProductCard } from './components/ProductCard';
import { Product } from './data/products';

// Example ShopPage component showing how to use ProductCard with onAddToCart
const ShopPage: React.FC = () => {
  // Sample products data
  const products: Product[] = [
    {
      id: 'dreamcurl-original',
      name: 'DreamCurl™ Original Set',
      price: '€39.99',
      image: '/path/to/image.jpg',
      colors: ['grey', 'black', 'white'],
      category: 'Heatless Hair Curling Rod',
      hairType: 'All Hair Types',
      description: 'Professional heatless curling system',
      featured: true
    },
    {
      id: 'curly-clip-1',
      name: 'Curved Resin Hair Clip',
      price: '€15.99',
      image: '/path/to/image2.jpg',
      colors: ['black', 'white'],
      category: 'Curly Hair Collection',
      hairType: 'Curly Hair',
      description: 'Duckbill grip hair clip',
      featured: false
    },
    {
      id: 'simple-product',
      name: 'Simple Product',
      price: '€12.99',
      image: '/path/to/image3.jpg',
      colors: [], // No colors - will not show color swatches
      category: 'Accessories',
      hairType: 'All Hair Types',
      description: 'A simple product without color options',
      featured: false
    }
  ];

  // Handle add to cart functionality
  const handleAddToCart = (product: { 
    id: string; 
    name: string; 
    price: string; 
    image: string; 
    activeColor: { name: string; bgClass: string } | null 
  }) => {
    console.log('🛒 Product added to cart:', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      image: product.image,
      selectedColor: product.activeColor ? product.activeColor.name : 'No color selected',
      colorClass: product.activeColor ? product.activeColor.bgClass : 'N/A'
    });

    // Here you would typically:
    // 1. Add the product to your cart state/context
    // 2. Show a success message
    // 3. Update cart count in navbar
    // 4. Maybe open a cart drawer/sidebar
    
    // Example cart logic:
    // addToCart({
    //   id: product.id,
    //   name: product.name,
    //   price: product.price,
    //   image: product.image,
    //   selectedColor: product.activeColor?.name,
    //   quantity: 1
    // });
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8">Shop Our Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onClick={() => {
              // Navigate to product detail page
              console.log('Navigate to product:', product.id);
            }}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default ShopPage;

// Example of what gets logged when clicking "Add to Cart":
/*
🛒 Product added to cart: {
  productId: "dreamcurl-original",
  productName: "DreamCurl™ Original Set",
  price: "€39.99",
  image: "/path/to/image.jpg",
  selectedColor: "grey", // or whatever color is currently selected
  colorClass: "bg-gray-400"
}

🛒 Product added to cart: {
  productId: "simple-product",
  productName: "Simple Product",
  price: "€12.99",
  image: "/path/to/image3.jpg",
  selectedColor: "No color selected",
  colorClass: "N/A"
}
*/
