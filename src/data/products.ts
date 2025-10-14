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
  video?: string;
  images?: string[];
  sizeOptions?: {
    [key: string]: {
      price: string;
      image: string;
      description: string[];
    };
  };
}

export const products: Product[] = [
  {
    id: "dreamcurl-original",
    name: "DreamCurl™ Original Set",
    price: "€39.99",
    image: new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
    category: "DreamCurl™ Collection",
    hairType: "Medium to Long",
    featured: true,
    description: [
      "The Original Heatless Curler - by CURLEA",
      "For bouncy, voluminous curls overnight. Designed for medium to long hair.",
      "This isn't just a heatless curler. It's the one that redefined the category.",
      "We invented the first curlers by size and engineered tools for how people actually sleep.",
      "Developed with elongated, structured fibres that hold shape through the night without wires, foam or tension.",
      "Exclusive vegan Peau de Soie fabric reduces friction and protects against overnight breakage.",
      "No bunching. No pressure. No stiffness behind your ears.",
      "Available in 4 colors: Mulberry, Candy, Latte, Olive",
      "The curler that makes people say, 'What did you use?'"
    ],
    ingredients: ["Vegan Peau de Soie Fabric", "Elongated Structured Fibres", "Glide-Safe Material"],
    size: "Original Size",
    inStock: true,
    colors: ["Mulberry", "Candy", "Latte", "Olive"],
    video: new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/Screen Recording 2025-10-11 005227.mp4', import.meta.url).href,
    images: [
      new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_3b575993-8e6a-413e-9f88-d95395c19980.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_686ff861-b01d-41ef-9c4c-0684df944cd6.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_bf658774-aed4-4c4a-be42-ef9707a47f3e.webp', import.meta.url).href
    ]
  },
  {
    id: "dreamcurl-short-set",
    name: "DreamCurl™ Short Set",
    price: "€24.99",
    image: new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href,
    category: "DreamCurl™ Collection",
    hairType: "All Types",
    featured: true,
    description: [
      "The Short Set Collection - Perfect for every hair type and style",
      "Create beautiful curls without heat damage",
      "Professional heatless curling system designed for versatility",
      "Available in 4 luxurious colors: Rose Gold, Royal Purple, Olive Lux, Earl Grey",
      "Compact design perfect for shorter hair or when you want tighter curls",
      "Same premium quality as our Original Set, just in a shorter format",
      "Perfect for travel and everyday styling",
      "Includes step-by-step styling guide for best results"
    ],
    ingredients: ["Vegan Peau de Soie Fabric", "Elongated Structured Fibres", "Glide-Safe Material"],
    size: "Short Size",
    inStock: true,
    colors: ["Rose Gold", "Royal Purple", "Olive Lux", "Earl Grey"],
    video: new URL('../assets/Heatless Hair Curling Rod/69fb9b50593547f3899618d65d85cec5.HD-1080p-7.2Mbps-11546034.mp4', import.meta.url).href,
    images: [
      new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/product-2.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/product-3.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/product-4.webp', import.meta.url).href
    ]
  },
  {
    id: "dreamcurl-midi",
    name: "DreamCurl™ Midi",
    price: "€34.99",
    image: new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
    category: "DreamCurl™ Collection",
    hairType: "Medium to Long",
    featured: true,
    description: [
      "The Perfect Middle Ground - DreamCurl™ Midi",
      "Ideal for medium-length hair that needs just the right amount of curl",
      "Not too big, not too small - just perfect for your styling needs",
      "Available in 4 beautiful colors: Purple, Candy, Latte, Marshmallow",
      "Professional heatless curling technology",
      "Comfortable overnight styling without wires or tension",
      "Premium vegan Peau de Soie fabric for hair protection",
      "Perfect for achieving natural-looking waves and curls"
    ],
    ingredients: ["Vegan Peau de Soie Fabric", "Elongated Structured Fibres", "Glide-Safe Material"],
    size: "Midi Size",
    inStock: true,
    colors: ["Purple", "Candy", "Latte", "Marshmallow"],
    video: new URL('../assets/Heatless Hair Curling Rod/midi_size/Screen Recording 2025-10-13 135516.mp4', import.meta.url).href,
    images: [
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_candy.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_latte.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_marshmello.webp', import.meta.url).href
    ]
  },
  {
    id: "dreamcurl-jumbo",
    name: "DreamCurl™ Jumbo",
    price: "€44.99",
    image: new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/purple_jumbo.webp', import.meta.url).href,
    category: "DreamCurl™ Collection",
    hairType: "Long",
    featured: true,
    description: [
      "The Ultimate Curling Experience - DreamCurl™ Jumbo",
      "Designed for long hair that demands maximum curl and volume",
      "Extra-large size creates stunning, dramatic curls",
      "Available in 4 premium colors: Purple, Candy, Latte, Olive",
      "Perfect for special occasions and dramatic styling",
      "Professional-grade heatless curling technology",
      "Comfortable overnight wear with premium materials",
      "Achieve salon-quality results at home"
    ],
    ingredients: ["Vegan Peau de Soie Fabric", "Elongated Structured Fibres", "Glide-Safe Material"],
    size: "Jumbo Size",
    inStock: true,
    colors: ["Purple", "Candy", "Latte", "Olive"],
    video: new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/guide (1).mp4', import.meta.url).href,
    images: [
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/purple_jumbo.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/candy_jumbo.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/olive_jumbo.webp4.webp', import.meta.url).href
    ]
  },
  {
    id: "bun-bons",
    name: "BUN BONS - Heatless Hair Styling Set",
    price: "€29.99",
    image: new URL('../assets/Heatless Hair Curling Rod/product5/pppp1.webp', import.meta.url).href,
    category: "Heatless Tools",
    hairType: "All Types",
    featured: true,
    description: [
      "Revolutionary Heatless Hair Styling - BUN BONS",
      "Create beautiful buns and updos without heat damage",
      "5 different styling tools for endless possibilities",
      "Perfect for quick styling and special occasions",
      "Easy-to-use design for all skill levels",
      "Includes step-by-step styling guide",
      "Professional results without professional tools",
      "Versatile styling for all hair types and lengths"
    ],
    ingredients: ["High-Quality Plastic", "Flexible Design", "Non-Slip Grip"],
    size: "5-Piece Set",
    inStock: true,
    video: new URL('../assets/Heatless Hair Curling Rod/product5/Screen Recording 2025-10-07 143110.mp4', import.meta.url).href,
    images: [
      new URL('../assets/Heatless Hair Curling Rod/product5/pppp1.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/product5/pppp2.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/product5/pppp3.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/product5/pppp4.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/product5/pppp5.webp', import.meta.url).href
    ]
  },
  {
    id: "peau-de-soie-bonnet",
    name: "PEAU DE SOIE | XL OVERNIGHT BONNET",
    price: "€39.99",
    image: new URL('../assets/Heatless Hair Curling Rod/product6/candy&marchmello.webp', import.meta.url).href,
    category: "Hair Accessories",
    hairType: "All Types",
    featured: true,
    description: [
      "For all overnight heatless styling enthusiasts, the CURLEA Reversible Bonnet is a must-have addition to your bedtime routine",
      "This XL Overnight Bonnet fits even over our largest size JUMBO heatless curler and provides a protective barrier against breakage and frizz",
      "Retains your hair's natural oils, resulting in healthy, shiny, and frizz-free hair each morning",
      "Crafted from the finest vegan silk alternative french fabric known as Peau De Soie",
      "This luxurious sleep cap ensures maximum comfort all night long",
      "Fights frizz, infuses hair with moisture, preserves hairstyles, prevents bed head, and leaves your hair with a glossy shine",
      "Suitable for all hair types, but especially beneficial for curly hair, thick hair, natural hair, or hair extensions",
      "Wearing the Peau De Soie Bonnet overnight is a natural conditioning treatment that nourishes your hair",
      "Upgrade your hair care regimen with the CURLEA Reversible Bonnet - an elegant addition to your bedtime attire"
    ],
    ingredients: ["Peau De Soie", "Vegan Silk Alternative", "French Fabric"],
    size: "XL Size",
    colors: ["CANDY & MARSHMALLOW", "LATTE & MARSHMALLOW", "OLIVE & LATTE"],
    inStock: true,
    video: new URL('../assets/Heatless Hair Curling Rod/product6/Screen Recording 2025-10-06 223323.mp4', import.meta.url).href,
    images: [
      new URL('../assets/Heatless Hair Curling Rod/product6/candy&marchmello.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/product6/latte&marchmello.webp4.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/product6/olive&latte.webp4.webp', import.meta.url).href
    ]
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
      "Choose from 9-piece complete set or 4-piece sets with different styles"
    ],
    ingredients: ["High-Quality Resin", "Durable Plastic", "Strong Grip Teeth"],
    size: "9-Piece Set",
    inStock: true,
    sizeOptions: {
      "9-piece-complete": {
        price: "€15.99",
        image: new URL('../assets/curly hair collection/product1/p1.jpg', import.meta.url).href,
        description: [
          "Complete 9-piece set with all clip sizes and styles",
          "Perfect for comprehensive hair styling needs",
          "Includes various sizes for different hair types",
          "Best value for money option"
        ]
      },
      "4-piece-type1": {
        price: "€8.99",
        image: new URL('../assets/curly hair collection/product1/p2.jpg', import.meta.url).href,
        description: [
          "4-piece set - Type 1 style",
          "Specific clip designs for targeted styling",
          "Ideal for specific hair styling preferences",
          "Compact set for focused needs"
        ]
      },
      "4-piece-type2": {
        price: "€8.99",
        image: new URL('../assets/curly hair collection/product1/p3.jpg', import.meta.url).href,
        description: [
          "4-piece set - Type 2 style",
          "Different clip designs for varied styling",
          "Perfect for specific styling requirements",
          "Compact set with unique designs"
        ]
      },
      "4-piece-type3": {
        price: "€8.99",
        image: new URL('../assets/curly hair collection/product1/p4.jpg', import.meta.url).href,
        description: [
          "4-piece set - Type 3 style",
          "Specialized clip designs for unique styling",
          "Great for specific hair styling needs",
          "Compact set with distinctive styles"
        ]
      }
    }
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
    video: new URL('../assets/curly hair collection/product2/Screen Recording 2025-10-04 143847.mp4', import.meta.url).href,
    images: [
      new URL('../assets/curly hair collection/product2/pp1.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product2/pp2.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product2/pp3.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product2/pp4.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product2/pp5.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product2/pp6.jpg', import.meta.url).href
    ]
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
    video: new URL('../assets/curly hair collection/product3/Screen Recording 2025-10-05 155052.mp4', import.meta.url).href,
    images: [
      new URL('../assets/curly hair collection/product3/ppp1.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product3/ppp2.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product3/ppp3.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product3/ppp4.jpg', import.meta.url).href
    ]
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
        "Choose from 9-piece complete set or 4-piece sets with different styles"
      ],
      ingredients: ["High-Quality Resin", "Durable Plastic", "Strong Grip Teeth"],
      size: "9-Piece Set",
      inStock: true,
      sizeOptions: {
        "9-piece-complete": {
          price: "€15.99",
          image: new URL('../assets/curly hair collection/product1/p1.jpg', import.meta.url).href,
          description: [
            "Complete 9-piece set with all clip sizes and styles",
            "Perfect for comprehensive hair styling needs",
            "Includes various sizes for different hair types",
            "Best value for money option"
          ]
        },
        "4-piece-type1": {
          price: "€8.99",
          image: new URL('../assets/curly hair collection/product1/p2.jpg', import.meta.url).href,
          description: [
            "4-piece set - Type 1 style",
            "Specific clip designs for targeted styling",
            "Ideal for specific hair styling preferences",
            "Compact set for focused needs"
          ]
        },
        "4-piece-type2": {
          price: "€8.99",
          image: new URL('../assets/curly hair collection/product1/p3.jpg', import.meta.url).href,
          description: [
            "4-piece set - Type 2 style",
            "Different clip designs for varied styling",
            "Perfect for specific styling requirements",
            "Compact set with unique designs"
          ]
        },
        "4-piece-type3": {
          price: "€8.99",
          image: new URL('../assets/curly hair collection/product1/p4.jpg', import.meta.url).href,
          description: [
            "4-piece set - Type 3 style",
            "Specialized clip designs for unique styling",
            "Great for specific hair styling needs",
            "Compact set with distinctive styles"
          ]
        }
      }
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
    },
    {
      id: "heatless-6",
      name: "PEAU DE SOIE | XL OVERNIGHT BONNET",
      price: "€39.99",
      image: new URL('../assets/Heatless Hair Curling Rod/product6/candy&marchmello.webp', import.meta.url).href,
      category: "Hair Accessories",
      hairType: "Curly",
      featured: true,
      description: [
        "For all overnight heatless styling enthusiasts, the CURLEA Reversible Bonnet is a must-have addition to your bedtime routine",
        "This XL Overnight Bonnet fits even over our largest size JUMBO heatless curler and provides a protective barrier against breakage and frizz",
        "Retains your hair's natural oils, resulting in healthy, shiny, and frizz-free hair each morning",
        "Crafted from the finest vegan silk alternative french fabric known as Peau De Soie",
        "This luxurious sleep cap ensures maximum comfort all night long",
        "Fights frizz, infuses hair with moisture, preserves hairstyles, prevents bed head, and leaves your hair with a glossy shine",
        "Suitable for all hair types, but especially beneficial for curly hair, thick hair, natural hair, or hair extensions",
        "Wearing the Peau De Soie Bonnet overnight is a natural conditioning treatment that nourishes your hair",
        "Upgrade your hair care regimen with the CURLEA Reversible Bonnet - an elegant addition to your bedtime attire"
      ],
      ingredients: ["Peau De Soie", "Vegan Silk Alternative", "French Fabric"],
      size: "XL Size",
      colors: ["CANDY & MARSHMALLOW", "LATTE & MARSHMALLOW", "OLIVE & LATTE"],
      inStock: true,
    }
  ];
};

// Helper function to get curly hair collection product by ID
export const getCurlyHairCollectionProductById = (id: string): Product | undefined => {
  return getCurlyHairCollectionProducts().find(product => product.id === id);
};
