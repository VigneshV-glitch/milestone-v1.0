/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Settings from './pages/Settings';
import { initializeTMSDatabase } from './utils/dbInit';
import { FeedbackOverlay } from './components/layout/FeedbackOverlay';
import UniversalSearch from './components/search/UniversalSearch';
import { AuthModal } from './components/auth/AuthModal';

// Pre-initialize databases synchronously if not present to ensure consistent state initializers
initializeTMSDatabase();

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string; filter?: string; value?: string }>;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
        if (customEvent.detail.filter && customEvent.detail.value) {
          sessionStorage.setItem("tms_nav_filter_field", customEvent.detail.filter);
          sessionStorage.setItem("tms_nav_filter_value", customEvent.detail.value);
        }
      }
    };
    window.addEventListener("tms-navigate", handleNavigate);
    return () => {
      window.removeEventListener("tms-navigate", handleNavigate);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Trips':
        return <Trips />;
      case 'Vehicles':
        return <Vehicles />;
      case 'Drivers':
        return <Drivers />;
      case 'Settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      <FeedbackOverlay />
      <UniversalSearch activeTab={activeTab} onTabChange={setActiveTab} />
      <AuthModal />
    </AppShell>
  );
}

