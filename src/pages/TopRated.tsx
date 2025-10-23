import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { TrendingUp } from "lucide-react";
import { DisplayTopRated } from "@/components/DisplayTopRated"

const TopRated = () => {

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap hover:opacity-80 transition-opacity">
              RateEverything
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Top Rankings</h2>
          </div>
          <div className="grid gap-3">
            <DisplayTopRated />
          </div>
        </div>
      </main>
      <Footer />
    </div>


  )
}

export default TopRated