
  import "@vibe/core/tokens";
  import "@fontsource-variable/figtree/wght.css";
  import "@fontsource-variable/figtree/wght-italic.css";
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
