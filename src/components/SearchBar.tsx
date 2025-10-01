import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

const popularCategories = [
  "All",
  "Movies",
  "Food",
  "Cars",
  "Events",
  "Books",
  "Music",
  "Places",
  "Technology",
  "People",
];

export const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchQuery = category !== "All" ? `${category} ${query.trim()}` : query.trim();
      onSearch(searchQuery);
    }
  };

  const handleCustomCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCategory.trim()) {
      setCategory(customCategory.trim());
      setCustomCategory("");
      setIsCustomInputOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-3xl gap-2">
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[110px] bg-card border-border">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border z-50">
          {popularCategories.map((cat) => (
            <SelectItem key={cat} value={cat} className="[&>span:last-child]:hidden">
              {cat}
            </SelectItem>
          ))}
          <div className="border-t border-border mt-1 pt-2 px-2 pb-2">
            {!isCustomInputOpen ? (
              <button
                type="button"
                onClick={() => setIsCustomInputOpen(true)}
                className="w-full text-left text-sm px-2 py-1.5 hover:bg-accent rounded-sm text-muted-foreground"
              >
                + Custom tag...
              </button>
            ) : (
              <form onSubmit={handleCustomCategorySubmit} className="flex gap-1">
                <Input
                  type="text"
                  placeholder="Enter custom tag"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-8 px-2">
                  Add
                </Button>
              </form>
            )}
          </div>
        </SelectContent>
      </Select>
      
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for anything to rate..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>
      
      <Button type="submit" disabled={loading || !query.trim()}>
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
};