import { useState } from "react";
import { Link } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults, WikiItem } from "@/components/SearchResults";
import { ItemDetail } from "@/components/ItemDetail";
import { TopRankings } from "@/components/TopRankings";
import { ReviewsList } from "@/components/ReviewsList";
import { ForumsList } from "@/components/ForumsList";
import { Footer } from "@/components/Footer";
import { searchWikipedia } from "@/lib/wikimedia";
import { TrendingUp, Star, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [searchResults, setSearchResults] = useState<WikiItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WikiItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

  if (selectedItem) {
    return (
      <div className="min-h-screen bg-background p-6">
        <ItemDetail item={selectedItem} onBack={handleBack} />
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
            
            <Button className="whitespace-nowrap">
              <User className="mr-2 h-4 w-4" />
              Sign In
            </Button>
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
    </div>
  );
};

export default Index;
