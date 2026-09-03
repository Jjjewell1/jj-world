import "./src/app/globals.css";
import "./src/components/theme-provider";
import "./src/components/animated-background";
import "./src/components/scroll-progress";
import { ThemeProvider } from "./src/components/theme-provider";
import { TooltipProvider } from "./src/components/ui/tooltip";

export default function Root({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <TooltipProvider>{<Component {...pageProps} /></TooltipProvider>}
    </ThemeProvider>
  );
}