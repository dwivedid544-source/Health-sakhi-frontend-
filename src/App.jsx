import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ScrollToTop from './components/app/ScrollToTop';
import RootRedirect from './components/app/RootRedirect';

// Loader component for page loading fallback
const PageLoader = () => (
  <div className="fixed[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-md">
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Outer spinning gradient ring */}
      <div className="absolute inset-0 rounded-full border-4 border-[#ff69b4]/10 border-t-[#ff69b4] animate-spin"></div>
      {/* Inner pulsing pink core */}
      <div className="w-8 h-8 rounded-full bg-[#ff69b4]/20 animate-ping"></div>
    </div>
    <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#ff69b4] animate-pulse">Loading Sakhi...</span>
  </div>
);

// Public Screens
const LandingPage = lazy(() => import('./screens/LandingPage'));
const HowToUsePage = lazy(() => import('./screens/HowToUsePage'));
const LibraryPage = lazy(() => import('./screens/LibraryPage'));
const LoginPage = lazy(() => import('./screens/LoginPage'));
const OTPScreen = lazy(() => import('./screens/OTPScreen'));
const PrivacyPolicy = lazy(() => import('./screens/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./screens/TermsOfService'));

// Member Screens
const UserHome = lazy(() => import('./screens/app/HomeScreen'));
const WellnessHubScreen = lazy(() => import('./screens/app/WellnessHubScreen'));
const WellnessModuleScreen = lazy(() => import('./screens/app/WellnessModuleScreen'));
const WellnessCenterScreen = lazy(() => import('./screens/app/WellnessCenterScreen'));
const SafetySupportScreen = lazy(() => import('./screens/app/SafetySupportScreen'));
const UserBooks = lazy(() => import('./screens/app/BookLibraryScreen'));
const BookDetailScreen = lazy(() => import('./screens/app/BookDetailScreen'));
const BookReader = lazy(() => import('./screens/app/BookScreen'));
const UserProfile = lazy(() => import('./screens/app/ProfileScreen'));
const AISakhiScreen = lazy(() => import('./screens/app/AISakhiScreen'));
const TodoScreen = lazy(() => import('./screens/app/TodoScreen'));
const FinanceScreen = lazy(() => import('./screens/app/FinanceScreen'));
const MentalHealthScreen = lazy(() => import('./screens/app/MentalHealthScreen'));
const MoodScreen = lazy(() => import('./screens/app/MoodScreen'));
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen'));
const PeriodTrackerScreen = lazy(() => import('./screens/app/PeriodTrackerScreen'));
const CommunityScreen = lazy(() => import('./screens/app/CommunityScreen'));
const RewardsScreen = lazy(() => import('./screens/app/RewardsScreen'));
const SubscriptionPlansScreen = lazy(() => import('./screens/app/SubscriptionPlansScreen'));
const ReceiptsScreen = lazy(() => import('./screens/app/ReceiptsScreen'));
const WellnessCertificateScreen = lazy(() => import('./screens/app/WellnessCertificateScreen'));
const PartnerSakhiScreen = lazy(() => import('./screens/app/PartnerSakhiScreen'));
const AskHealthSakhiScreen = lazy(() => import('./screens/app/AskHealthSakhiScreen'));
const FAQScreen = lazy(() => import('./screens/app/FAQScreen'));
const SakhiDiaryScreen = lazy(() => import('./screens/app/SakhiDiaryScreen'));

// Additional Wellness Sakhis
const MeditationScreen = lazy(() => import('./screens/app/MeditationScreen'));
const AffirmationScreen = lazy(() => import('./screens/app/AffirmationScreen'));
const WealthScreen = lazy(() => import('./screens/app/WealthScreen'));
const RelationshipScreen = lazy(() => import('./screens/app/RelationshipScreen'));
const GroomingScreen = lazy(() => import('./screens/app/GroomingScreen'));
const SpiritualScreen = lazy(() => import('./screens/app/SpiritualScreen'));
const SessionBookingScreen = lazy(() => import('./screens/app/SessionBookingScreen'));

// Advisor Screens
const AdvisorDash = lazy(() => import('./screens/advisor/AdvisorDashboard'));
const AdvisorApts = lazy(() => import('./screens/advisor/AdvisorAppointments'));
const UserProfilesScreen = lazy(() => import('./screens/advisor/UserProfilesScreen'));
const SlotManagementScreen = lazy(() => import('./screens/advisor/SlotManagementScreen'));
const AdvisorEarningsScreen = lazy(() => import('./screens/advisor/AdvisorEarningsScreen'));
const AdvisorChat = lazy(() => import('./screens/advisor/AdvisorChat'));

// Admin Screens
const AdminDash = lazy(() => import('./screens/admin/AdminDashboard'));
const UserMgmt = lazy(() => import('./screens/admin/UserManagement'));
const PartnerMgmt = lazy(() => import('./screens/admin/PartnerManagement'));
const ContentCMS = lazy(() => import('./screens/admin/ContentCMS'));
const BookCMS = lazy(() => import('./screens/admin/BookCMS'));
const AddBookCMS = lazy(() => import('./screens/admin/AddBookCMS'));
const AdvisorCMS = lazy(() => import('./screens/admin/AdvisorCMS'));
const GlobalAppointments = lazy(() => import('./screens/admin/GlobalAppointments'));
const PaymentMgmt = lazy(() => import('./screens/admin/PaymentManagement'));
const PlanMgmt = lazy(() => import('./screens/admin/PlanManagement'));
const SystemAnalytics = lazy(() => import('./screens/admin/SystemAnalytics'));
const CampaignCenter = lazy(() => import('./screens/admin/CampaignCenter'));
const AdminMessages = lazy(() => import('./screens/admin/AdminMessages'));
const AdvisorConsultations = lazy(() => import('./screens/advisor/AdvisorConsultations'));
const LandingPageManager = lazy(() => import('./screens/admin/LandingPageManager'));
const CommunityManagement = lazy(() => import('./screens/admin/CommunityManagement'));

// Partner (Affiliate) Screens
const AffiliateDash = lazy(() => import('./screens/affiliate/AffiliateDashboard'));
const LinkGenerator = lazy(() => import('./screens/affiliate/LinkGenerator'));
const PartnerEarnings = lazy(() => import('./screens/affiliate/PartnerEarnings'));
const MarketingAssets = lazy(() => import('./screens/affiliate/MarketingAssets'));

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* ── Public (landing layout only wraps marketing pages) ── */}
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="how-to-use" element={<HowToUsePage />} />
          <Route path="library" element={<LibraryPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/otp" element={<Navigate to="/login" replace />} />
        <Route path="/welcome" element={<Navigate to="/app" replace />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/public/books/:id" element={<BookReader />} />

        {/* ── 👤 Member Dashboard ── */}
        <Route path="/app" element={<DashboardLayout role="member" />}>
          <Route index element={<UserHome />} />
          <Route path="wellness">
            <Route index element={<WellnessHubScreen />} />
            <Route path=":slug" element={<WellnessModuleScreen />} />
          </Route>
          <Route path="wellness-center" element={<WellnessCenterScreen />} />
          <Route path="safety" element={<SafetySupportScreen />} />
          <Route path="books" element={<UserBooks />} />
          <Route path="books/:id" element={<BookDetailScreen />} />
          <Route path="books/:id/read" element={<BookReader />} />
          <Route path="ai-sakhi" element={<AISakhiScreen />} />
          <Route path="todo" element={<TodoScreen />} />
          <Route path="mental-health" element={<MentalHealthScreen />} />
          <Route path="meditation" element={<Navigate to="/app/books" replace />} />
          <Route path="affirmation" element={<AffirmationScreen />} />
          <Route path="affirmations" element={<Navigate to="/app/affirmation" replace />} />
          <Route path="budget" element={<FinanceScreen />} />
          <Route path="wealth" element={<WealthScreen />} />
          <Route path="love" element={<RelationshipScreen />} />
          <Route path="grooming" element={<GroomingScreen />} />
          <Route path="spiritual" element={<SpiritualScreen />} />
          <Route path="sessions" element={<SessionBookingScreen />} />
          <Route path="mood/:moodType" element={<MoodScreen />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="period" element={<PeriodTrackerScreen />} />
          <Route path="community" element={<CommunityScreen />} />
          <Route path="rewards" element={<RewardsScreen />} />
          <Route path="wellness-certificate" element={<WellnessCertificateScreen />} />
          <Route path="partner-sakhi" element={<PartnerSakhiScreen />} />
          <Route path="ask-health-sakhi" element={<AskHealthSakhiScreen />} />
          <Route path="faq" element={<FAQScreen />} />
          <Route path="diary" element={<SakhiDiaryScreen />} />
          <Route path="plans" element={<SubscriptionPlansScreen />} />
          <Route path="receipts" element={<ReceiptsScreen />} />
          <Route path="finance" element={<FinanceScreen />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>

        {/* ── 🛠️ Admin Panel ── */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<AdminDash />} />
          <Route path="users" element={<UserMgmt />} />
          <Route path="partners" element={<PartnerMgmt />} />
          <Route path="content" element={<ContentCMS />} />
          <Route path="books" element={<BookCMS />} />
          <Route path="books/add" element={<AddBookCMS />} />
          <Route path="plans" element={<PlanMgmt />} />
          <Route path="payments" element={<PaymentMgmt />} />
          <Route path="analytics" element={<SystemAnalytics />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="notifications" element={<CampaignCenter />} />
          <Route path="landing-page" element={<LandingPageManager />} />
          <Route path="community" element={<CommunityManagement />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* ── 💰 Partner Dashboard ── */}
        <Route path="/affiliate" element={<DashboardLayout role="partner" />}>
          <Route index element={<AffiliateDash />} />
          <Route path="links" element={<LinkGenerator />} />
          <Route path="earnings" element={<PartnerEarnings />} />
          <Route path="assets" element={<MarketingAssets />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Suspense>
    </>
  );
};

export default App;
