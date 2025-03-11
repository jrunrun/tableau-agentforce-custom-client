import React, { useState } from "react";
import {
  ChatWindow,
  ChatMinimized,
  ChatErrorBoundary,
} from "./components/chat";
import { GitHubLink } from "./components/GitHubLink";
import ContentLayout from "./components/ContentLayout";
import ThemeProvider from "./contexts/ThemeContext";

const AppContent: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
 

      {/* Main Content */}
      <main className="px-4 py-8">

   
        
      </main>

      {/* Chat Widget */}
      {!isChatOpen && <ChatMinimized onMaximize={() => setIsChatOpen(true)} />}
      {isChatOpen && (
        <ChatErrorBoundary>
          <ChatWindow
            agentRole="AI Concierge"
            onClose={() => setIsChatOpen(false)}
          />
        </ChatErrorBoundary>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
