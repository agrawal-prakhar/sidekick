import React, { ReactNode } from "react";
import Header from "./Header";

// Layout component for the main application structure
// Provides consistent header and main content area layout

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

export default Layout;
