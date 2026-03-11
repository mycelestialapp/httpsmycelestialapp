import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import OraclePage from '@/pages/OraclePage';
import OracleReadingPage from '@/pages/OracleReadingPage';
import ToolsPage from '@/pages/ToolsPage';
import RelationshipsPage from '@/pages/RelationshipsPage';
import RhythmPage from '@/pages/RhythmPage';
import LibraryPage from '@/pages/LibraryPage';
import CosmicMessagePage from '@/pages/CosmicMessagePage';
import SoulArchetypePage from '@/pages/SoulArchetypePage';
import LenormandLibraryPage from '@/pages/LenormandLibraryPage';
import ZodiacPairingPage from '@/pages/ZodiacPairingPage';
import ReadingHistoryPage from '@/pages/ReadingHistoryPage';
import NumerologyHome from '@/pages/NumerologyHome';
import NumerologyResultPage from '@/pages/NumerologyResultPage';
import NumerologyLibraryPage from '@/pages/NumerologyLibraryPage';
import NumerologyPersonalYearPage from '@/pages/NumerologyPersonalYearPage';
import NumerologyNumberDetailPage from '@/pages/NumerologyNumberDetailPage';
import AuthPage from '@/pages/AuthPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import SettingsPage from '@/pages/SettingsPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import ProfilePage from '@/pages/ProfilePage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import BaziPage from '@/pages/BaziPage';
import NotFound from '@/pages/NotFound';

const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<OraclePage />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/relationships" element={<RelationshipsPage />} />
      <Route path="/rhythm" element={<RhythmPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/oracle/reading" element={<OracleReadingPage />} />
      <Route path="/oracle/cosmic" element={<CosmicMessagePage />} />
      <Route path="/oracle/soul" element={<SoulArchetypePage />} />
      <Route path="/oracle/lenormand-library" element={<LenormandLibraryPage />} />
      <Route path="/oracle/pairing" element={<ZodiacPairingPage />} />
      <Route path="/oracle/bazi" element={<BaziPage />} />
      <Route path="/readings" element={<ReadingHistoryPage />} />
      <Route path="/numerology" element={<NumerologyHome />} />
      <Route path="/numerology/result" element={<NumerologyResultPage />} />
      <Route path="/numerology/library" element={<NumerologyLibraryPage />} />
      <Route path="/numerology/year" element={<NumerologyPersonalYearPage />} />
      <Route path="/numerology/library/:number" element={<NumerologyNumberDetailPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/change-password" element={<ChangePasswordPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/subscribe" element={<SubscriptionPage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
