import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ApiRequestIndicator from './components/ApiRequestIndicator';
import ToastViewport from './components/ToastViewport';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <ApiRequestIndicator />
      <ToastViewport />
      <main className="app-main">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
