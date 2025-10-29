import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ItemDetail } from "@/components/ItemDetail";
import { WikiItem } from "@/components/SearchResults";
import { getWikipediaPage } from "@/lib/wikimedia";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { SearchBar } from "@/components/SearchBar";
import { useAuth } from "@/lib/auth";
import { convertFirebaseUser } from "@/lib/user";
import { Link } from "react-router-dom";
import { TrendingUp, Star, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ItemPage = () => {
  const { pageid } = useParams<{ pageid: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<WikiItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadItem = async () => {
      if (!pageid) {
        navigate("/");
        return;
      }

      setIsLoading(true);
      try {
        const pageIdNum = parseInt(pageid, 10);
        if (isNaN(pageIdNum)) {
          navigate("/");
          return;
        }

        const itemData = await getWikipediaPage(pageIdNum);
        if (!itemData) {
          navigate("/");
          return;
        }
        setItem(itemData);
      } catch (error) {
        console.error("Error loading item:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [pageid, navigate]);

  const handleBack = () => {
    navigate("/");
  };

  const handleSearch = async (query: string) => {
    setSearchLoading(true);
    try {
      // Navigate to home page with search - this could be enhanced later
      navigate("/");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const currentUser = user ? convertFirebaseUser(user) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap hover:opacity-80 transition-opacity">
                RateEverything
              </Link>
              <div className="flex-1">
                <SearchBar onSearch={handleSearch} loading={searchLoading} />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading item...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap hover:opacity-80 transition-opacity">
              RateEverything
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-card border-border">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border z-50 w-56">
                <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Top 100 Most Rated
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                  <Star className="mr-2 h-4 w-4" />
                  Top 100 Highest Rated
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} loading={searchLoading} />
            </div>
            
            <Link to="/forum">
              <Button variant="outline" className="whitespace-nowrap">
                Forum
              </Button>
            </Link>
            
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={currentUser.photoURL} />
                      <AvatarFallback className="text-xs">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{currentUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border z-50 w-56">
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-accent text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="whitespace-nowrap"
                onClick={() => setAuthModalOpen(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <ItemDetail item={item} onBack={handleBack} />
      </main>
      
      <Footer />
      
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </div>
  );
};

export default ItemPage;

