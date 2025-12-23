import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="text-center animate-fade-in">
        <div className="text-8xl font-display font-bold text-primary/20 mb-4">
          404
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Home size={18} />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
