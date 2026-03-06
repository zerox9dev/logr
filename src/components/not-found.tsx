import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl font-bold text-muted-foreground/30">404</span>
      <h1 className="text-xl font-bold mt-4">Page not found</h1>
      <p className="text-sm text-muted-foreground mt-2">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="mt-6">
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
