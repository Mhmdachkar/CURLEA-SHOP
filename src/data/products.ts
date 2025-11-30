export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string; // For sale prices (compare at price)
  numericPrice?: number; // Numeric price for calculations (from Supabase)
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
    name: "CURLEA DreamCurl™ Original Set",
    price: "$22.99",
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
      new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_bf658774-aed4-4c4a-be42-ef9707a47f3e.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/IMG-3641.webp', import.meta.url).href
    ]
  },
  {
    id: "dreamcurl-short-set",
    name: "CURLEA DreamCurl™ Short Set",
    price: "$16.99",
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
    name: "CURLEA DreamCurl™ Midi",
    price: "$22.99",
    image: new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
    category: "DreamCurl™ Collection",
    hairType: "Medium to Long",
    featured: true,
    description: [
      "The Perfect Middle Ground - DreamCurl™ Midi",
      "Ideal for medium-length hair that needs just the right amount of curl",
      "Not too big, not too small - just perfect for your styling needs",
      "Available in 4 beautiful colors: Candy, Latte, Mulberry, Olive",
      "Professional heatless curling technology",
      "Comfortable overnight styling without wires or tension",
      "Premium vegan Peau de Soie fabric for hair protection",
      "Perfect for achieving natural-looking waves and curls"
    ],
    ingredients: ["Vegan Peau de Soie Fabric", "Elongated Structured Fibres", "Glide-Safe Material"],
    size: "Midi Size",
    inStock: true,
    colors: ["CANDY", "LATTE", "MULBERRY", "OLIVE"],
    video: new URL('../assets/Heatless Hair Curling Rod/midi_size/Screen Recording 2025-10-13 135516.mp4', import.meta.url).href,
    images: [
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_candy.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_latte.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_olive.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_guide.webp', import.meta.url).href
    ]
  },
  {
    id: "dreamcurl-jumbo",
    name: "CURLEA DreamCurl™ Jumbo Size",
    price: "$22.99",
    image: new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
    category: "DreamCurl™ Collection",
    hairType: "All Types",
    featured: true,
    description: [
      "Jumbo Heatless Curler - by CURLEA",
      "For soft, voluminous waves with a looser curl shape. Designed for hair below the shoulders.",
      "It's easy to assume Jumbo means it's made for longer hair. But in reality, Jumbo refers to the thickness of the curler - not the length of your hair.",
      "This size was created for those who prefer a looser, more open curl shape, with soft volume and gentle movement instead of tight definition. Think less structure, more flow.",
      "At CURLEA, we were the first to design curlers by size.",
      "This is the curler that makes people say, 'What did you use?' And the one you'll feel proud to answer with: 'CURLEA.'",
      "Each set includes: 1 Jumbo Size Heatless Curler, 2 Matching Hair Ties, 1 Hair Clip for easy wrapping"
    ],
    ingredients: ["100% Vegan Peau De Soie Fabric", "Elongated Structured Fibres", "Premium Memory Foam"],
    size: "Jumbo Size",
    inStock: true,
    colors: ["LATTE", "CANDY", "OLIVE", "MULBERRY"],
    video: new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/guide (1).mp4', import.meta.url).href,
    images: [
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/candy_jumbo.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/olive_jumbo.webp4.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/purple_jumbo.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/guide.webp', import.meta.url).href
    ]
  },
  {
    id: "zero-heat-mini",
    name: "CURLEA Zero Heat Mini Set",
    price: "$22.99",
    image: new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href,
    category: "DreamCurl™ Collection",
    hairType: "Short to Medium",
    featured: true,
    description: [
      "Our 'Zero Heat' Curling Rod is made out of the finest Peau De Soie fabric to help you achieve frizz-free shiny curls.",
      "The Zero Heat set includes:",
      "• 2 Scrunchies",
      "• 1 Curling Rod",
      "• 1 Hair Claw Clip",
      "We use sustainably grown materials to fill our Curling Rod which means that not only does it make our product extremely comfortable to sleep with, but it also takes us all a step closer to a cleaner and safer environment - now that's what I call a Win-Win!",
      "*Please note, we do our best to match the curler sets with our claw clips that we have in stock. If you wish to receive a specific colour please leave a note with your order and we'll do our best to accommodate",
      "Perfect for shorter hair or those who want tighter, more defined curls",
      "Compact design ideal for travel and everyday styling"
    ],
    ingredients: ["Finest Peau De Soie Fabric", "Sustainably Grown Materials", "Premium Fill"],
    size: "Mini Size",
    inStock: true,
    colors: ["OLIVE", "LATTE", "CANDY", "PURPLE"],
    images: [
      new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-latte.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-candy.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-purple.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-guide.webp', import.meta.url).href
    ]
  },
  // Removed duplicate: peau-de-soie-bonnet (keep only curated curly collection version)
  {
    id: "curly-clip-1",
    name: "CURLEA Curved Resin Hair Clip - Duckbill Grip & Strong Teeth",
    price: "$14.99",
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
          price: "$14.99",
        image: new URL('../assets/curly hair collection/product1/p1.jpg', import.meta.url).href,
        description: [
          "Complete 9-piece set with all clip sizes and styles",
          "Perfect for comprehensive hair styling needs",
          "Includes various sizes for different hair types",
          "Best value for money option"
        ]
      },
      "4-piece-type1": {
        price: "$8.99",
        image: new URL('../assets/curly hair collection/product1/p2.jpg', import.meta.url).href,
        description: [
          "4-piece set - Type 1 style",
          "Specific clip designs for targeted styling",
          "Ideal for specific hair styling preferences",
          "Compact set for focused needs"
        ]
      },
      "4-piece-type2": {
        price: "$8.99",
        image: new URL('../assets/curly hair collection/product1/p3.jpg', import.meta.url).href,
        description: [
          "4-piece set - Type 2 style",
          "Different clip designs for varied styling",
          "Perfect for specific styling requirements",
          "Compact set with unique designs"
        ]
      },
      "4-piece-type3": {
        price: "$8.99",
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
    name: "CURLEA Elegant Satin Scarf + Scrunchies Set",
    price: "$11.99",
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
    id: "satin-scrunchies-french-5pc",
    name: "CURLEA Satin Scrunchies Luxury French 5 Piece",
    price: "$6.77",
    image: new URL('../assets/curly hair collection/scrunchies/scrunchies.webp', import.meta.url).href,
    category: "Hair Accessories",
    hairType: "Curly",
    featured: true,
    description: [
      "A Touch of Parisian Elegance: Inspired by timeless French sophistication, this 5-piece scrunchie set elevates every hairstyle with effortless grace.",
      "Lustrous Satin Finish: Crafted from the finest silky satin for a soft, glossy texture that glides through hair without pulling or creasing.",
      "Gentle & Protective Hold: Designed to reduce friction and prevent breakage, keeping your hair smooth, shiny, and frizz-free all day.",
      "Luxury in Every Detail: Each scrunchie embodies understated refinement—perfect for both daily wear and special occasions.",
      "Versatile Styling: Ideal for ponytails, buns, or wrist wear as an elegant accessory.",
      "Premium Presentation: Delivered in a beautifully packaged set, perfect for gifting or personal indulgence."
    ],
    ingredients: ["Premium Satin", "Luxury French Fabric", "Gentle Elastic"],
    size: "5-Piece Set",
    inStock: true,
    images: [
      new URL('../assets/curly hair collection/scrunchies/scrunchies.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/scrunchies/scrunchiess.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/scrunchies/scrunchiesss.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/scrunchies/guide-scrunchies.webp', import.meta.url).href
    ]
  },
  {
    id: "curly-claw-1",
    name: "CURLEA Geometric Flower Hair Claw Clip Set",
    price: "$15.99",
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
      "**Comes as complete set - includes 10 pieces total**",
      "Full collection provides variety for all styling needs"
    ],
    ingredients: ["High-Quality Plastic", "Matte Finish", "Strong Claw Mechanism"],
    size: "10-Piece Set",
    inStock: true,
    video: new URL('../assets/curly hair collection/product3/Screen Recording 2025-10-05 155052.mp4', import.meta.url).href,
    images: [
      new URL('../assets/curly hair collection/product3/ppp1.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product3/ppp2.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product3/ppp3.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product3/ppp4.jpg', import.meta.url).href
    ]
  },
  {
    id: "songmay-hair-clips",
    name: "CURLEA Luxe Alloy Hair Clips",
    price: "$3.99",
    image: new URL('../assets/curly hair collection/product4/SongMay Woman Hair Clips.jpg', import.meta.url).href,
    category: "Hair Accessories",
    hairType: "Curly",
    featured: true,
    description: [
      "Includes both Gold and Print colors in one package (not sold separately)",
      "Premium alloy construction with elegant gold finish for luxury styling",
      "Large U-shaped design perfect for securing medium to long hair",
      "Minimalist modern style that fits both casual and elegant outfits",
      "Strong grip functionality - holds hair firmly without tugging or slipping",
      "Fashion-forward Y2K and minimalist design trending accessory",
      "Lightweight metal construction comfortable for all-day wear",
      "Versatile styling for buns, half-updos, twists, or side-swept looks",
      "High perceived value with premium metal build vs plastic clips",
      "Perfect for retail display, packaging, and gifting presentation",
      "Custom branding potential for private label opportunities"
    ],
    ingredients: ["Premium Alloy", "Gold Finish", "Lightweight Metal"],
    size: "Large U-Shaped",
    inStock: true,
    colors: ["Gold", "Print"],
    images: [
      new URL('../assets/curly hair collection/product4/SongMay Woman Hair Clips.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product4/gold.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product4/print.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product4/clip.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product4/gol2.jpg', import.meta.url).href,
      new URL('../assets/curly hair collection/product4/placeholder.jpg', import.meta.url).href
    ]
  },
  {
    id: "heatless-5",
    name: "CURLEA Bun Bons Heatless Curling System",
    price: "$19.99",
    image: new URL('../assets/Heatless Hair Curling Rod/product5/pppp2.webp', import.meta.url).href,
    category: "Heatless Tools",
    hairType: "All Types",
    featured: true,
    description: [
      "Experience overnight blowout-style volume with exceptional comfort and secure sleep",
      "Innovation that transformed heatless hairstyling - created by CURLEA, named by our community",
      "Unique curling system encased within a protective capsule",
      "Thoughtfully designed to reduce friction, preserve shape, and leave hair smoother and shinier",
      "Layered design creates curls while safeguarding hair from damage and friction",
      "Inner elongated fiber fill holds form without applying pressure",
      "Outer vegan Peau de Soie layer allows strands to glide smoothly, minimizing friction",
      "Lightweight, refined, and luxurious styling experience with subtle gold-accent buttons",
      "Perfect for those who love wrapping sections to achieve lift at the crown",
      "Available in Original Size (fine to medium hair) and Jumbo Size (thick hair)"
    ],
    ingredients: ["Vegan Peau de Soie", "Elongated Fiber Fill", "Gold-accent Buttons"],
    size: "3 Heatless Curlers + 3 Matching Mini Bonnets",
    inStock: true,
    colors: ["MULBERRY", "CANDY", "LATTE", "OLIVE"],
    usageSteps: [
      "Start with clean, dry hair (80-90% dry for best results)",
      "Divide your hair into 3-4 sections at the crown area",
      "Take one BUN BONS curler and place it at the base of a section",
      "Wrap your hair around the curler in a spiral motion, working from roots to ends",
      "Secure the wrapped hair with the elegant gold-accent buttons",
      "Repeat the process for all sections, using different sized curlers if needed",
      "Cover everything with the coordinating Peau de Soie bonnet for protection",
      "Sleep comfortably overnight or leave in for 4-6 hours during the day",
      "Remove the bonnet and carefully unwind each curler in reverse order",
      "Gently separate the curls with your fingers and enjoy your beautiful blowout-style waves"
    ]
  },
  {
    id: "dreamcurl-midi",
    name: "CURLEA DreamCurl™ Midi",
    price: "$22.99",
    image: new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
    category: "DreamCurl™ Collection",
    hairType: "Short to Long",
    featured: true,
    description: [
      "Immerse yourself in the ultimate blend of luxury and comfort with CURLEA, the undisputed leader in the world of heatless curlers, where every night's sleep feels like resting on a cloud.",
      "Experience a new level of heatless hair styling with our 'Zero Heat' Heatless Curlers. At CURLEA, we get that your beauty sleep is crucial, especially when it comes to heatless overnight curls.",
      "That's why each of our handcrafted curlers is made to be extra soft, using the finest fabrics to keep your hair safe from friction as you snooze peacefully.",
      "You can count on us to prioritise your hair's health and your comfort all the way. With a wide-reaching influence in the social media community, CURLEA shines brightest among its imitators.",
      "Crafted from the finest 100% vegan Peau De Soie fabric, CURLEA's iconic heatless curler helps you create bouncy and voluminous heatless overnight curls.",
      "Tailored for short to long hair. Providing a tighter curl, our Midi size is the perfect choice for those in search of extended curl longevity.",
      "Crafted with sustainably sourced, ultra-soft fibres, our heatless curlers provide a night of sheer luxury and hair protection while championing a greener, brighter future.",
      "Elevate your hairstyle to new heights with CURLEA - your go-to for unmatched comfort, style, and luxury all in one.",
      "This set will include: 2 Hair Ties, 1 Midi Heatless Curler, 1 Hair Clip"
    ],
    ingredients: ["100% Vegan Peau De Soie Fabric", "Sustainably Sourced Ultra-Soft Fibres", "Glide-Safe Material"],
    size: "Midi Size",
    inStock: true,
    colors: ["CANDY", "LATTE", "MULBERRY", "OLIVE"],
    video: new URL('../assets/Heatless Hair Curling Rod/midi_size/Screen Recording 2025-10-13 135516.mp4', import.meta.url).href,
    images: [
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_candy.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_latte.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_olive.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_guide.webp', import.meta.url).href
    ]
  },
  {
    id: "dreamcurl-jumbo",
    name: "CURLEA DreamCurl™ Jumbo Size",
    price: "$22.99",
    image: new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
    category: "DreamCurl™ Collection",
    hairType: "All Types",
    featured: true,
    description: [
      "Jumbo Heatless Curler - by CURLEA",
      "For soft, voluminous waves with a looser curl shape. Designed for hair below the shoulders.",
      "It's easy to assume Jumbo means it's made for longer hair. But in reality, Jumbo refers to the thickness of the curler - not the length of your hair.",
      "This size was created for those who prefer a looser, more open curl shape, with soft volume and gentle movement instead of tight definition. Think less structure, more flow.",
      "At CURLEA, we were the first to design curlers by size.",
      "This is the curler that makes people say, 'What did you use?' And the one you'll feel proud to answer with: 'CURLEA.'",
      "Each set includes: 1 Jumbo Size Heatless Curler, 2 Matching Hair Ties, 1 Hair Clip for easy wrapping"
    ],
    ingredients: ["100% Vegan Peau De Soie Fabric", "Elongated Structured Fibres", "Premium Memory Foam"],
    size: "Jumbo Size",
    inStock: true,
    colors: ["LATTE", "CANDY", "OLIVE", "MULBERRY"],
    video: new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/guide (1).mp4', import.meta.url).href,
    images: [
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/candy_jumbo.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/olive_jumbo.webp4.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/purple_jumbo.webp', import.meta.url).href,
      new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/guide.webp', import.meta.url).href
    ]
  },
  {
    id: "curlea-comb",
    name: "CURLEA Comb",
    price: "$2.99",
    image: new URL('../assets/curly hair collection/product7/product7.webp', import.meta.url).href,
    category: "Hair Accessories",
    hairType: "Curly",
    featured: true,
    description: [
      "Are you tired of losing your curls' bounce and definition after brushing? Say hello to a game-changer that has taken the beauty world by storm—our specially designed curl comb!",
      "Widely celebrated and going viral numerous times, this innovative tool is crafted to preserve your curls' integrity while achieving that effortlessly chic \"brushed out\" look.",
      "Our comb is expertly designed to gently glide through your curls as they bounce back to their original spiral shape.",
      "The secret lies in the thoughtfully placed circular cutouts between each tooth, allowing for smooth detangling without compromising your curls' natural shape.",
      "It's not just a comb; it's your curls' new best friend, transforming the way you style and care for your hair.",
      "Experience the difference and join the countless curl enthusiasts who have embraced this revolutionary tool.",
      "Get ready to redefine your curl game!"
    ],
    ingredients: ["Premium Materials", "Circular Cutouts Design", "Curl-Friendly Teeth"],
    size: "One Size",
    inStock: true,
    video: new URL('../assets/curly hair collection/product7/Screen Recording 2025-10-21 013440.mp4', import.meta.url).href,
    images: [
      new URL('../assets/curly hair collection/product7/product7.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/product7/Gemini_Generated_Image_vpzo3jvpzo3jvpzo.png', import.meta.url).href
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
      name: "CURLEA Curved Resin Hair Clip - Duckbill Grip & Strong Teeth",
      price: "$14.99",
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
          price: "$14.99",
          image: new URL('../assets/curly hair collection/product1/p1.jpg', import.meta.url).href,
          description: [
            "Complete 9-piece set with all clip sizes and styles",
            "Perfect for comprehensive hair styling needs",
            "Includes various sizes for different hair types",
            "Best value for money option"
          ]
        },
        "4-piece-type1": {
          price: "$8.99",
          image: new URL('../assets/curly hair collection/product1/p2.jpg', import.meta.url).href,
          description: [
            "4-piece set - Type 1 style",
            "Specific clip designs for targeted styling",
            "Ideal for specific hair styling preferences",
            "Compact set for focused needs"
          ]
        },
        "4-piece-type2": {
          price: "$8.99",
          image: new URL('../assets/curly hair collection/product1/p3.jpg', import.meta.url).href,
          description: [
            "4-piece set - Type 2 style",
            "Different clip designs for varied styling",
            "Perfect for specific styling requirements",
            "Compact set with unique designs"
          ]
        },
        "4-piece-type3": {
          price: "$8.99",
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
      name: "CURLEA Elegant Satin Scarf + Scrunchies Set",
    price: "$11.99",
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
      id: "satin-scrunchies-french-5pc",
      name: "CURLEA Satin Scrunchies Luxury French 5 Piece",
      price: "$6.77",
      image: new URL('../assets/curly hair collection/scrunchies/scrunchies.webp', import.meta.url).href,
      category: "Hair Accessories",
      hairType: "Curly",
      featured: true,
      description: [
        "A Touch of Parisian Elegance: Inspired by timeless French sophistication, this 5-piece scrunchie set elevates every hairstyle with effortless grace.",
        "Lustrous Satin Finish: Crafted from the finest silky satin for a soft, glossy texture that glides through hair without pulling or creasing.",
        "Gentle & Protective Hold: Designed to reduce friction and prevent breakage, keeping your hair smooth, shiny, and frizz-free all day.",
        "Luxury in Every Detail: Each scrunchie embodies understated refinement—perfect for both daily wear and special occasions.",
        "Versatile Styling: Ideal for ponytails, buns, or wrist wear as an elegant accessory.",
        "Premium Presentation: Delivered in a beautifully packaged set, perfect for gifting or personal indulgence."
      ],
      ingredients: ["Premium Satin", "Luxury French Fabric", "Gentle Elastic"],
      size: "5-Piece Set",
      inStock: true,
      images: [
        new URL('../assets/curly hair collection/scrunchies/scrunchies.webp', import.meta.url).href,
        new URL('../assets/curly hair collection/scrunchies/scrunchiess.webp', import.meta.url).href,
        new URL('../assets/curly hair collection/scrunchies/scrunchiesss.webp', import.meta.url).href,
        new URL('../assets/curly hair collection/scrunchies/guide-scrunchies.webp', import.meta.url).href
      ]
    },
    {
      id: "curly-claw-1",
      name: "CURLEA Geometric Flower Hair Claw Clip Set",
      price: "$15.99",
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
        "**Comes as complete set - includes 10 pieces total**",
        "Full collection provides variety for all styling needs"
      ],
      ingredients: ["High-Quality Plastic", "Matte Finish", "Strong Claw Mechanism"],
      size: "10-Piece Set",
      inStock: true,
    },
    {
      id: "songmay-hair-clips",
      name: "CURLEA Luxe Alloy Hair Clips",
      price: "$3.99",
      image: new URL('../assets/curly hair collection/product4/SongMay Woman Hair Clips.jpg', import.meta.url).href,
      category: "Hair Accessories",
      hairType: "Curly",
      featured: true,
      description: [
        "Includes both Gold and Print colors in one package (not sold separately)",
        "Premium alloy construction with elegant gold finish for luxury styling",
        "Large U-shaped design perfect for securing medium to long hair",
        "Minimalist modern style that fits both casual and elegant outfits",
        "Strong grip functionality - holds hair firmly without tugging or slipping",
        "Fashion-forward Y2K and minimalist design trending accessory",
        "Lightweight metal construction comfortable for all-day wear",
        "Versatile styling for buns, half-updos, twists, or side-swept looks",
        "High perceived value with premium metal build vs plastic clips",
        "Perfect for retail display, packaging, and gifting presentation",
        "Custom branding potential for private label opportunities"
      ],
      ingredients: ["Premium Alloy", "Gold Finish", "Lightweight Metal"],
      size: "Large U-Shaped",
      inStock: true,
      colors: ["Gold", "Print"]
    },
    {
      id: "curlea-comb",
      name: "CURLEA Comb",
      price: "$2.99",
      image: new URL('../assets/curly hair collection/product7/product7.webp', import.meta.url).href,
      category: "Hair Accessories",
      hairType: "Curly",
      featured: true,
      description: [
        "Are you tired of losing your curls' bounce and definition after brushing? Say hello to a game-changer that has taken the beauty world by storm—our specially designed curl comb!",
        "Widely celebrated and going viral numerous times, this innovative tool is crafted to preserve your curls' integrity while achieving that effortlessly chic \"brushed out\" look.",
        "Our comb is expertly designed to gently glide through your curls as they bounce back to their original spiral shape.",
        "The secret lies in the thoughtfully placed circular cutouts between each tooth, allowing for smooth detangling without compromising your curls' natural shape.",
        "It's not just a comb; it's your curls' new best friend, transforming the way you style and care for your hair.",
        "Experience the difference and join the countless curl enthusiasts who have embraced this revolutionary tool.",
        "Get ready to redefine your curl game!"
      ],
      ingredients: ["Premium Materials", "Circular Cutouts Design", "Curl-Friendly Teeth"],
      size: "One Size",
      inStock: true,
      video: new URL('../assets/curly hair collection/product7/Screen Recording 2025-10-21 013440.mp4', import.meta.url).href,
      images: [
        new URL('../assets/curly hair collection/product7/product7.webp', import.meta.url).href,
        new URL('../assets/curly hair collection/product7/Gemini_Generated_Image_vpzo3jvpzo3jvpzo.png', import.meta.url).href
      ]
    }
  ];
};

// Helper function to get curly hair collection product by ID
export const getCurlyHairCollectionProductById = (id: string): Product | undefined => {
  return getCurlyHairCollectionProducts().find(product => product.id === id);
};
