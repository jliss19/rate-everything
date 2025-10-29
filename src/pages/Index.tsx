import { useState } from "react";
import { Link } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults, WikiItem } from "@/components/SearchResults";
import { ItemDetail } from "@/components/ItemDetail";
import { TopRankings } from "@/components/TopRankings";
import { ReviewsList } from "@/components/ReviewsList";
import { ForumsList } from "@/components/ForumsList";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { searchWikipedia } from "@/lib/wikimedia";
import { useAuth } from "@/lib/auth";
import { convertFirebaseUser } from "@/lib/user";
import { TrendingUp, Star, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const [searchResults, setSearchResults] = useState<WikiItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WikiItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const { user, logout } = useAuth();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSelectedItem(null);
    setHasSearched(true);
    
    try {
      const results = await searchWikipedia(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemSelect = (item: WikiItem) => {
    setSelectedItem(item);
  };

  const handleBack = () => {
    setSelectedItem(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentUser = user ? convertFirebaseUser(user) : null;

  if (selectedItem) {
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
                <SearchBar onSearch={handleSearch} loading={isLoading} />
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
                    <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
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
          <ItemDetail item={selectedItem} onBack={handleBack} />
        </main>
        
        <Footer />
        
        <AuthModal 
          open={authModalOpen} 
          onOpenChange={setAuthModalOpen} 
        />
      </div>
    );
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
              <SearchBar onSearch={handleSearch} loading={isLoading} />
            </div>
            
            <Link to="/forum">
              <Button variant="outline" className="whitespace-nowrap">
                Forum
              </Button>
            </Link>

            <Link to="/toprated">
              <Button variant="outline" className="whitespace-nowrap">
                Top Rated
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
                  <DropdownMenuItem className="cursor-pointer hover:bg-accent">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
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
      <main className="container mx-auto px-6 py-8 flex-1">
        {!hasSearched ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Top Rankings */}
            <div className="lg:col-span-1">
              <TopRankings />
            </div>
            
            {/* Middle Column - Recent Reviews */}
            <div className="lg:col-span-1">
              <ReviewsList />
            </div>
            
            {/* Right Column - Active Forums */}
            <div className="lg:col-span-1">
              <ForumsList />
            </div>
          </div>
        ) : (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Searching...</span>
              </div>
            ) : (
              <SearchResults 
                results={searchResults} 
                onItemSelect={handleItemSelect}
              />
            )}
          </div>
        )}
      </main>
      
      <Footer />
      
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </div>
  );
};

export default Index;
