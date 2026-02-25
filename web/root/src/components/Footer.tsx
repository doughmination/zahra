import { Github, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-10">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="font-semibold gradient-text">Zahra</span>
          <span>The moderen, free and open-sourced Discord bot</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/doughmination/zahra" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            <Github className="h-4 w-4" />
          </a>
          <span className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-primary" /> by the community
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
