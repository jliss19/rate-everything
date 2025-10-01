import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults, WikiItem } from "@/components/SearchResults";
import { ItemDetail } from "@/components/ItemDetail";
import { searchWikipedia } from "@/lib/wikimedia";
import { Star, TrendingUp, Users, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
              RateEverything
            </h1>
            <SearchBar onSearch={handleSearch} loading={isLoading} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!hasSearched ? (
          <div className="max-w-4xl mx-auto">
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2 text-card-foreground">Universal Rating</h3>
                  <p className="text-muted-foreground">Rate literally anything that exists in our universe with our 5-star system.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-accent" />
                  <h3 className="text-lg font-semibold mb-2 text-card-foreground">Community Driven</h3>
                  <p className="text-muted-foreground">Join millions of users sharing their opinions and discovering new things to rate.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-rating-gold" />
                  <h3 className="text-lg font-semibold mb-2 text-card-foreground">Instant Discovery</h3>
                  <p className="text-muted-foreground">Powered by Wikipedia's vast database for instant information and images.</p>
                </CardContent>
              </Card>
            </div>

            {/* Popular Categories */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Popular to Rate</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Marvel Movies", "Pizza Places", "Programming Languages", "Dog Breeds",
                  "Video Games", "Coffee Shops", "Books", "Celebrities", "Countries",
                  "Inventions", "Art Pieces", "Music Albums", "Restaurants", "Technologies"
                ].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleSearch(category)}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                  >
                    {category}
                  </button>
                ))}
              </div>
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
    </div>
  );
};

export default Index;
