import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ForCompaniesPage } from './pages/ForCompaniesPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { CompanyDashboardPage } from './pages/company/CompanyDashboardPage';
import { CompanyJobsPage } from './pages/company/CompanyJobsPage';
import { CompanyProfilePage } from './pages/company/CompanyProfilePage';
import { CompanyVerificationPage } from './pages/company/CompanyVerificationPage';
import { CandidateReviewPage } from './pages/company/CandidateReviewPage';
import { HiringPipelinePage } from './pages/company/HiringPipelinePage';
import { JobFormPage } from './pages/company/JobFormPage';
import { AdminPanel } from './pages/AdminPanel';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/for-companies" element={<ForCompaniesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['CANDIDATE']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route
        path="/applications"
        element={
          <ProtectedRoute roles={['CANDIDATE']}>
            <ApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/:id"
        element={
          <ProtectedRoute roles={['CANDIDATE']}>
            <ApplicationDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={['CANDIDATE']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company"
        element={
          <ProtectedRoute roles={['COMPANY']}>
            <CompanyDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/jobs"
        element={
          <ProtectedRoute roles={['COMPANY']}>
            <CompanyJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/jobs/new"
        element={
          <ProtectedRoute roles={['COMPANY']}>
            <JobFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/jobs/:jobId/edit"
        element={
          <ProtectedRoute roles={['COMPANY']}>
            <JobFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/candidates"
        element={
          <ProtectedRoute roles={['COMPANY']}>
            <CandidateReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/pipeline"
        element={
          <ProtectedRoute roles={['COMPANY']}>
            <HiringPipelinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/profile"
        element={
          <ProtectedRoute roles={['COMPANY']}>
            <CompanyProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/verification"
        element={
          <ProtectedRoute roles={['COMPANY']}>
            <CompanyVerificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
