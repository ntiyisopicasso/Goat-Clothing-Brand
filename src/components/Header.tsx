import { useState } from "react";
import { ShoppingCart, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import goatLogo from "@/assets/goat-logo.jpeg";

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onCategorySelect: (category: string) => void;
}

const categories = [
  "Caps",
  "Accessories", 
  "Hoodies",
  "T-shirts",
  "Jackets",
  "Combo"
];

export default function Header({ cartItemsCount, onCartClick, onCategorySelect }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <img src={goatLogo} alt="GOAT Logo" className="h-10 w-10 rounded-lg" />
          <div className="name">
<h1 className="text-xl font-bold bg-gradient-to-r from-red-900 to-red-600 bg-clip-text text-transparent">
  G.O.A.T
</h1>
            
            <p className="text-xs text-muted-foreground -mt-1">Let's Grind In Style</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1">
                <span>Categories</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 bg-popover border-border">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => onCategorySelect(category)}
                  className="cursor-pointer hover:bg-accent"
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Cart and Mobile Menu */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCartClick}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gold text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                {cartItemsCount}
              </span>
            )}
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background border-border">
              <div className="flex flex-col space-y-4 mt-8">
                <h2 className="text-lg font-semibold text-gold">Categories</h2>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      onCategorySelect(category);
                      setIsMenuOpen(false);
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}