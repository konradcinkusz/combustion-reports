import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import CarsPage from './pages/CarsPage.jsx';
import FuelsPage from './pages/FuelsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ReportsPage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/fuels" element={<FuelsPage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* Anything else lands on the reports page rather than a blank screen. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
