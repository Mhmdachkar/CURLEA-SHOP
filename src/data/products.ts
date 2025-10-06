export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  hairType: string;
  featured?: boolean;
  description: string[];
  ingredients?: string[];
  size?: string;
  colors?: string[];
  usageSteps?: string[];
  inStock?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Hydrating Argan Oil Serum",
    price: "€42.00",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop",
    category: "Serum",
    hairType: "All Types",
    description: [
      "Enhances natural curls and shine",
      "Lightweight hydration without residue",
      "Sulfate-free and paraben-free formula",
      "Luxurious texture with instant absorption",
      "Suitable for all hair types",
    ],
    ingredients: ["Argan Oil", "Keratin", "Vitamin E", "Natural Oils"],
    size: "100ml",
    inStock: true,
  },
  {
    id: "2",
    name: "Curl Defining Cream",
    price: "€38.00",
    image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&h=600&fit=crop",
    category: "Styling",
    hairType: "Curly",
    featured: true,
    description: [
      "Defines and enhances natural curl pattern",
      "Provides long-lasting hold without stiffness",
      "Moisturizes while styling",
      "Reduces frizz and flyaways",
      "Lightweight, non-greasy formula",
    ],
    ingredients: ["Shea Butter", "Coconut Oil", "Aloe Vera", "Natural Gums"],
    size: "150ml",
    inStock: true,
  },
  {
    id: "3",
    name: "Intensive Hair Mask",
    price: "€45.00",
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&h=600&fit=crop",
    category: "Treatment",
    hairType: "All Types",
    description: [
      "Deep conditioning treatment for damaged hair",
      "Repairs split ends and strengthens strands",
      "Restores natural moisture balance",
      "Leaves hair silky smooth and manageable",
      "Recommended for weekly use",
    ],
    ingredients: ["Keratin", "Argan Oil", "Hyaluronic Acid", "Proteins"],
    size: "250ml",
    inStock: true,
  },
  {
    id: "4",
    name: "Smoothing Shampoo",
    price: "€32.00",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop",
    category: "Shampoo",
    hairType: "Straight",
    description: [
      "Gentle cleansing for all hair types",
      "Sulfate-free formula preserves natural oils",
      "Adds shine and smoothness",
      "Safe for color-treated hair",
      "Refreshing botanical scent",
    ],
    ingredients: ["Coconut Surfactants", "Aloe Vera", "Vitamin B5", "Natural Extracts"],
    size: "300ml",
    inStock: true,
  },
  {
    id: "5",
    name: "Nourishing Conditioner",
    price: "€34.00",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=600&fit=crop",
    category: "Conditioner",
    hairType: "Wavy",
    description: [
      "Rich conditioning for wavy and curly hair",
      "Detangles without weighing hair down",
      "Enhances natural wave pattern",
      "Provides thermal protection",
      "Leaves hair soft and touchable",
    ],
    ingredients: ["Shea Butter", "Argan Oil", "Silk Proteins", "Panthenol"],
    size: "300ml",
    inStock: true,
  },
  {
    id: "6",
    name: "Volumizing Spray",
    price: "€28.00",
    image: "https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=600&h=600&fit=crop",
    category: "Styling",
    hairType: "All Types",
    description: [
      "Adds volume and body to fine hair",
      "Lightweight formula doesn't weigh down",
      "Provides flexible hold",
      "Enhances natural texture",
      "Easy to apply and style",
    ],
    ingredients: ["Sea Salt", "Aloe Vera", "Natural Polymers", "Vitamins"],
    size: "200ml",
    inStock: true,
  },
  {
    id: "7",
    name: "Repair & Shine Oil",
    price: "€48.00",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop",
    category: "Serum",
    hairType: "Curly",
    description: [
      "Intensive repair for damaged hair",
      "Adds brilliant shine and luster",
      "Protects against heat damage",
      "Suitable for daily use",
      "Non-greasy, fast-absorbing formula",
    ],
    ingredients: ["Argan Oil", "Jojoba Oil", "Vitamin E", "Antioxidants"],
    size: "50ml",
    inStock: true,
  },
  {
    id: "8",
    name: "Deep Cleanse Shampoo",
    price: "€35.00",
    image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=600&h=600&fit=crop",
    category: "Shampoo",
    hairType: "All Types",
    description: [
      "Deep cleansing for product buildup",
      "Removes impurities and excess oils",
      "Refreshes scalp and hair",
      "Safe for all hair types",
      "Recommended for weekly use",
    ],
    ingredients: ["Tea Tree Oil", "Mint Extract", "Natural Surfactants", "Botanicals"],
    size: "300ml",
    inStock: true,
  },
  {
    id: "curly-clip-1",
    name: "Curved Resin Hair Clip - Duckbill Grip & Strong Teeth",
    price: "€15.99",
    image: new URL('../assets/curly hair collection/product1/p1.jpg', import.meta.url).href,
    category: "Hair Accessories",
    hairType: "Curly",
    featured: true,
    description: [
      "Comfortable curved resin design with duckbill grip",
      "Strong teeth for secure and stylish hair styling",
      "New flat circular hollow design for unique fashionable look",
      "Perfect for parties, weddings, and daily use",
      "Made of high-quality plastic for durability and comfort",
      "Suitable for women and girls of all ages",
      "Available in colorful options and customized sizes",
      "Versatile accessory for various hair styling needs",
      "Sold as complete set - includes 9 pieces total",
      "Full collection provides variety for all styling needs"
    ],
    ingredients: ["High-Quality Resin", "Durable Plastic", "Strong Grip Teeth"],
    size: "9-Piece Set",
    inStock: true,
  },
  {
    id: "curly-scarf-1",
    name: "MIO Elegant Scarf - Soft Satin Hair Band & Scrunchies",
    price: "€12.99",
    image: new URL('../assets/curly hair collection/product2/pp1.jpg', import.meta.url).href,
    category: "Hair Accessories",
    hairType: "Curly",
    featured: true,
    description: [
      "Soft satin material prevents hair breakage and frizz",
      "Elegant solid color design with fashionable ribbon bow",
      "Versatile elastic hair band and scrunchies set",
      "Perfect for protecting hair while sleeping or styling",
      "Suitable for all hair types and lengths",
      "High-quality fabric that doesn't snag or pull hair",
      "**Comes as complete set - includes 7 pieces total**",
      "Full collection provides variety for all styling needs"
    ],
    ingredients: ["Premium Satin", "Elastic Band", "Fashion Ribbon"],
    size: "7-Piece Set",
    inStock: true,
  },
  {
    id: "curly-claw-1",
    name: "HC027D Fashion Solid Elegant Neutral Geometric Flower Hair Claw Clips",
    price: "€19.99",
    image: new URL('../assets/curly hair collection/product3/ppp1.jpg', import.meta.url).href,
    category: "Hair Accessories",
    hairType: "Curly",
    featured: true,
    description: [
      "Fashion solid elegant neutral geometric flower design",
      "Large matte hair claw clamps perfect for thick hair",
      "Durable construction with strong grip for secure hold",
      "Elegant neutral colors complement any outfit",
      "Geometric flower pattern adds sophisticated style",
      "Perfect for women and girls with thick hair",
      "Versatile styling for various hair lengths",
      "Comfortable to wear all day long",
      "**Comes as complete set - includes 16 pieces total**",
      "Full collection provides variety for all styling needs"
    ],
    ingredients: ["High-Quality Plastic", "Matte Finish", "Strong Claw Mechanism"],
    size: "16-Piece Set",
    inStock: true,
  }
];

// Helper function to get product by ID
export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

// Helper function to get products by category
export const getProductsByCategory = (category: string): Product[] => {
  if (category === "All") return products;
  return products.filter(product => product.category === category);
};

// Helper function to get products by hair type
export const getProductsByHairType = (hairType: string): Product[] => {
  if (hairType === "All Types") return products;
  return products.filter(product => product.hairType === hairType);
};

// Special function to get curly hair collection products
export const getCurlyHairCollectionProducts = (): Product[] => {
  return [
    {
      id: "curly-clip-1",
      name: "Curved Resin Hair Clip - Duckbill Grip & Strong Teeth",
      price: "€15.99",
      image: new URL('../assets/curly hair collection/product1/p1.jpg', import.meta.url).href,
      category: "Hair Accessories",
      hairType: "Curly",
      featured: true,
      description: [
        "Comfortable curved resin design with duckbill grip",
        "Strong teeth for secure and stylish hair styling",
        "New flat circular hollow design for unique fashionable look",
        "Perfect for parties, weddings, and daily use",
        "Made of high-quality plastic for durability and comfort",
        "Suitable for women and girls of all ages",
        "Available in colorful options and customized sizes",
        "Versatile accessory for various hair styling needs",
        "Sold as complete set - includes 9 pieces total",
        "Full collection provides variety for all styling needs"
      ],
      ingredients: ["High-Quality Resin", "Durable Plastic", "Strong Grip Teeth"],
      size: "9-Piece Set",
      inStock: true,
    },
    {
    id: "curly-scarf-1",
    name: "MIO Elegant Scarf - Soft Satin Hair Band & Scrunchies",
    price: "€12.99",
    image: new URL('../assets/curly hair collection/product2/pp1.jpg', import.meta.url).href,
    category: "Hair Accessories",
      hairType: "Curly",
      featured: true,
      description: [
        "Soft satin material prevents hair breakage and frizz",
        "Elegant solid color design with fashionable ribbon bow",
        "Versatile elastic hair band and scrunchies set",
        "Perfect for protecting hair while sleeping or styling",
        "Suitable for all hair types and lengths",
        "High-quality fabric that doesn't snag or pull hair",
        "**Comes as complete set - includes 7 pieces total**",
        "Full collection provides variety for all styling needs"
      ],
      ingredients: ["Premium Satin", "Elastic Band", "Fashion Ribbon"],
      size: "7-Piece Set",
      inStock: true,
    },
    {
      id: "curly-claw-1",
      name: "HC027D Fashion Solid Elegant Neutral Geometric Flower Hair Claw Clips",
      price: "€19.99",
      image: new URL('../assets/curly hair collection/product3/ppp1.jpg', import.meta.url).href,
      category: "Hair Accessories",
      hairType: "Curly",
      featured: true,
      description: [
        "Fashion solid elegant neutral geometric flower design",
        "Large matte hair claw clamps perfect for thick hair",
        "Durable construction with strong grip for secure hold",
        "Elegant neutral colors complement any outfit",
        "Geometric flower pattern adds sophisticated style",
        "Perfect for women and girls with thick hair",
        "Versatile styling for various hair lengths",
        "Comfortable to wear all day long",
        "**Comes as complete set - includes 16 pieces total**",
        "Full collection provides variety for all styling needs"
      ],
      ingredients: ["High-Quality Plastic", "Matte Finish", "Strong Claw Mechanism"],
      size: "16-Piece Set",
      inStock: true,
    }
  ];
};

// Helper function to get curly hair collection product by ID
export const getCurlyHairCollectionProductById = (id: string): Product | undefined => {
  return getCurlyHairCollectionProducts().find(product => product.id === id);
};
