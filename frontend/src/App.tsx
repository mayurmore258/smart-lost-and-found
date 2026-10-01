import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { Home } from './pages/Home';
import { FoundItems } from './pages/FoundItems';
import { ReportLost } from './pages/ReportLost';
import { ReportFound } from './pages/ReportFound';
import { Searching } from './pages/Searching';
import { PossibleMatches } from './pages/PossibleMatches';
import { MatchDetails } from './pages/MatchDetails';
import { Verification } from './pages/Verification';
import { MyReports } from './pages/MyReports';

export const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('home');
  const [routeParams, setRouteParams] = useState<any>({});

  const handleNavigate = (path: string, params: any = {}) => {
    setCurrentPath(path);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPath) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'found-items':
        return (
          <FoundItems
            onNavigate={handleNavigate}
            initialQuery={routeParams.query}
            initialCategory={routeParams.category}
          />
        );
      case 'report-lost':
        return <ReportLost onNavigate={handleNavigate} />;
      case 'report-found':
        return <ReportFound onNavigate={handleNavigate} />;
      case 'searching':
        return (
          <Searching
            itemId={routeParams.itemId || 'lost_item'}
            itemDetails={routeParams.itemDetails}
            onNavigate={handleNavigate}
          />
        );
      case 'possible-matches':
        return (
          <PossibleMatches
            itemId={routeParams.itemId}
            itemDetails={routeParams.itemDetails}
            matches={routeParams.matches}
            onNavigate={handleNavigate}
          />
        );
      case 'match-details':
        return (
          <MatchDetails
            matchId={routeParams.matchId}
            match={routeParams.match}
            userItem={routeParams.userItem}
            onNavigate={handleNavigate}
          />
        );
      case 'verification':
        return (
          <Verification
            matchId={routeParams.matchId}
            match={routeParams.match}
            onNavigate={handleNavigate}
          />
        );
      case 'my-reports':
        return <MyReports onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#121312] text-gray-900 dark:text-[#c5c9c5] transition-colors">
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />
      <main className="w-full pt-16 flex-1 flex flex-col">
        {renderCurrentPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
