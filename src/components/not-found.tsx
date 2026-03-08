import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import s from "./not-found.module.css";

export function NotFound() {
  return (
    <div className={s.container}>
      <span className={s.code}>404</span>
      <h1 className={s.title}>Page not found</h1>
      <p className={s.message}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/app" className={s.action}>
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
