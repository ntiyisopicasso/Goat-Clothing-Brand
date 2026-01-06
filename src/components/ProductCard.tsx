import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Palette, Plus } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, customization?: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [customization, setCustomization] = useState("");
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // Colors available for hoodies, jackets, and t-shirts
  const colorOptions = ["white", "black", "red", "pink", "purple"];
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  
  // Show colors on all products, sizes only on clothing
  const needsColorSize = true;
  const needsSizes = ["Hoodies", "Jackets", "T-shirts"].includes(product.category);

  const handleAddToCart = () => {
    let finalCustomization = "";
    
    // Add color and size to customization if selected
    const colorText = selectedColor ? `Color: ${selectedColor}` : "";
    const sizeText = selectedSize ? `Size: ${selectedSize}` : "";
    const extras = [colorText, sizeText].filter(Boolean).join(", ");
    
    if (extras) {
      finalCustomization = extras;
    }
    
    onAddToCart(product, finalCustomization || undefined);
    setSelectedColor("");
    setSelectedSize("");
  };

  const handleCustomizeAndAdd = () => {
    let finalCustomization = customization;
    
    // Add color and size to customization if selected
    if (needsColorSize) {
      const colorText = selectedColor ? `Color: ${selectedColor}` : "";
      const sizeText = selectedSize ? `Size: ${selectedSize}` : "";
      const extras = [colorText, sizeText].filter(Boolean).join(", ");
      
      if (extras) {
        finalCustomization = finalCustomization 
          ? `${finalCustomization}. ${extras}` 
          : extras;
      }
    }
    
    if (finalCustomization.trim()) {
      onAddToCart(product, finalCustomization);
      setCustomization("");
      setSelectedColor("");
      setSelectedSize("");
    }
    setIsCustomizing(false);
  };

  return (
    <Card className="group overflow-hidden bg-gradient-[var(--gradient-card)] border-border hover:shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:scale-105">
      <CardContent className="p-0">
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-[var(--transition-smooth)]"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3">
            {product.description}
          </p>
          {needsColorSize && (
            <div className="space-y-3 mb-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-red-500 ring-2 ring-red-200' 
                          : 'border-border hover:border-red-300'
                      } ${
                        color === 'white' ? 'bg-white' :
                        color === 'black' ? 'bg-black' :
                        color === 'red' ? 'bg-red-500' :
                        color === 'pink' ? 'bg-pink-500' :
                        'bg-purple-500'
                      }`}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                    />
                  ))}
                </div>
              </div>
              
              {needsSizes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Size</Label>
                  <div className="flex flex-wrap gap-1">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 text-sm rounded border transition-all ${
                          selectedSize === size
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-background border-border hover:border-red-300 hover:bg-red-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-red-600">
              R{product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={handleAddToCart}
          className="flex-1"
          variant="red"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
        
        <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Palette className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-red-600">Customize Your {product.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Describe how you want your product customized (colors, text, etc.)
              </p>
              
              {needsColorSize && (
                <div className={`grid ${needsSizes ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-4 h-4 rounded border border-border ${
                                  color === 'white' ? 'bg-white' :
                                  color === 'black' ? 'bg-black' :
                                  color === 'red' ? 'bg-red-500' :
                                  color === 'pink' ? 'bg-pink-500' :
                                  'bg-purple-500'
                                }`}
                              />
                              {color.charAt(0).toUpperCase() + color.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {needsSizes && (
                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Select value={selectedSize} onValueChange={setSelectedSize}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
              
              <Textarea
                placeholder="e.g., Add my name 'John' in gold letters on the front, make it oversized fit..."
                value={customization}
                onChange={(e) => setCustomization(e.target.value)}
                className="min-h-[100px] bg-input border-border"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setIsCustomizing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="red"
                  onClick={handleCustomizeAndAdd}
                  disabled={!selectedColor && !customization.trim() && (needsSizes ? !selectedSize : false)}
                >
                  Add Custom Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}