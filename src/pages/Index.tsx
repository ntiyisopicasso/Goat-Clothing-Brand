import { useState } from "react";
import Header from "@/components/Header";
import ProductCard, { Product } from "@/components/ProductCard";
import Cart, { CartItem } from "@/components/Cart";
import Checkout from "@/components/Checkout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
// Import your product images here - add your own images to src/assets/ folder
import hoodie1 from "@/assets/hoodie-1.jpeg";
import hoodie2 from "@/assets/hoodie-2.jpeg";
import hoodie3 from "@/assets/hoodie-3.jpeg";
import hoodie4 from "@/assets/hoodie-4.jpeg";
import cap1 from "@/assets/cap-1.jpeg";
import cap2 from "@/assets/cap-2.jpeg";  // Add your cap images
import cap3 from "@/assets/cap-3.jpeg";
import cap4 from "@/assets/cap-4.jpeg";
import cap5 from "@/assets/cap-5.jpeg";
import shirt1 from "@/assets/tshirt-1.jpeg";
import shirt2 from "@/assets/tshirt-2.jpeg"; // Add your shirt images
import shirt3 from "@/assets/tshirt-3.jpeg";
import jacket1 from "@/assets/jacket.jpeg";
import combo1 from "@/assets/combo-1.jpeg"; // Add your combo images
import combo2 from "@/assets/combo-2.jpeg";
import combo3 from "@/assets/combo-3.jpeg";
import accessory1 from "@/assets/as-1.jpeg"; // Add your accessory images
import accessory2 from "@/assets/as-2.jpeg";

// Products organized by category - easy to edit names, prices, and descriptions
console.log('Products loading with imports:', { hoodie1, jacket1, cap1, shirt1 });
const sampleProducts: Product[] = [
  // 4 HOODIES
  {
    id: "h1",
    name: "GOAT Premium Hoodie",
    description: "Premium streetwear hoodie with gold accents and superior comfort",
    price: 399.99,
    image: hoodie1,
    category: "Hoodies",
  },
  {
    id: "h2",
    name: "GOAT LAVA Hoodie",
    description: "Lava streetwear hoodie with remix accents and superior comfort",
    price: 449.99,
    image: hoodie2,
    category: "Hoodies",
  },
  {
    id: "h3",
    name: "GOAT 117 Hoodie",
    description: "117 streetwear hoodie",
    price: 499.99,
    image: hoodie3,
    category: "Hoodies",
  },
  {
    id: "h4",
    name: "GOAT Mythical Hoodie",
    description: "Mythical streetwear hoodie with superior comfort",
    price: 899.99,
    image: hoodie4,
    category: "Hoodies",
  },

  // 5 CAPS
  {
    id: "c1",
    name: "GOAT Signature Cap",
    description: "Stylish snapback cap with embroidered logo",
    price: 299.99,
    image: cap1,
    category: "Caps",
  },
  {
    id: "c2",
    name: "GOAT Classic Cap",
    description: "Classic design cap with premium materials",
    price: 249.99,
    image: cap2,
    category: "Caps",
  },
  {
    id: "c3",
    name: "GOAT Street Cap",
    description: "Urban style cap for everyday wear",
    price: 199.99,
    image: cap3,
    category: "Caps",
  },
  {
    id: "c4",
    name: "GOAT Elite Cap",
    description: "Elite edition cap with special features",
    price: 349.99,
    image: cap4,
    category: "Caps",
  },
  {
    id: "c5",
    name: "GOAT Limited Cap",
    description: "Limited edition cap - exclusive design",
    price: 399.99,
    image: cap5,
    category: "Caps",
  },

  // 3 T-SHIRTS
  {
    id: "t1",
    name: "GOAT Essential Tee",
    description: "Premium cotton t-shirt with minimalist design",
    price: 399.99,
    image: shirt1,
    category: "T-shirts",
  },
  {
    id: "t2",
    name: "GOAT Graphic Tee",
    description: "Bold graphic design on premium cotton",
    price: 349.99,
    image: shirt2,
    category: "T-shirts",
  },
  {
    id: "t3",
    name: "GOAT Classic Tee",
    description: "Classic fit t-shirt with logo print",
    price: 299.99,
    image: shirt3,
    category: "T-shirts",
  },

  // 1 JACKET
  {
    id: "j1",
    name: "GOAT Urban Jacket",
    description: "Weatherproof jacket for the modern urban lifestyle",
    price: 1299.99,
    image: jacket1,
    category: "Jackets",
  },

  // 2 ACCESSORIES
  {
    id: "a1",
    name: "GOAT Gold Chain",
    description: "Premium gold-plated chain accessory",
    price: 599.99,
    image: accessory1,
    category: "Accessories",
  },
  {
    id: "a2",
    name: "GOAT Silver Ring",
    description: "Sterling silver ring with GOAT logo",
    price: 399.99,
    image: accessory2,
    category: "Accessories",
  },

  // 3 COMBOS
  {
    id: "combo1",
    name: "GOAT Style Combo",
    description: "Complete outfit bundle: Hoodie + Cap + Tee",
    price: 1399.99,
    image: combo1,
    category: "Combo",
  },
  {
    id: "combo2",
    name: "GOAT Street Combo",
    description: "Street style bundle: Jacket + Cap + Accessories",
    price: 1699.99,
    image: combo2,
    category: "Combo",
  },
  {
    id: "combo3",
    name: "GOAT Premium Combo",
    description: "Premium bundle: All essentials included",
    price: 2199.99,
    image: combo3,
    category: "Combo",
  },
];

export default function Index() {
  const [products] = useState<Product[]>(sampleProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const addToCart = (product: Product, customization?: string) => {
    const cartId = `${product.id}-${Date.now()}-${Math.random()}`;
    const newItem: CartItem = {
      ...product,
      quantity: 1,
      customization,
      cartId,
    };
    
    setCartItems((prev) => [...prev, newItem]);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(cartId);
      return;
    }
    
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemsCount={cartItemsCount}
        onCartClick={() => setIsCartOpen(true)}
        onCategorySelect={setSelectedCategory}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-900 to-red-600 bg-clip-text text-transparent">
              G.O.A.T
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            Lets Grind In Style
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Premium streetwear for those who dare to be different. 
            Express your unique style with our exclusive collection.
          </p>
        </section>

        {/* Category Filter */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? "red" : "ghost"}
            onClick={() => setSelectedCategory(null)}
          >
            All Products
          </Button>
          {["Caps", "Accessories", "Hoodies", "T-shirts", "Jackets", "Combo"].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "red" : "ghost"}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {selectedCategory ? selectedCategory : "All Products"}
            </h2>
            <Badge variant="secondary">
              {filteredProducts.length} items
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No products found in this category.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Cart */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Checkout */}
      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        total={cartTotal}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}