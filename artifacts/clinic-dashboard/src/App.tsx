import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import Dashboard from "@/pages/dashboard";
import ClinicsPage from "@/pages/clinics";
import OffersPage from "@/pages/offers";
import AppointmentsPage from "@/pages/appointments";
import DiscountsPage from "@/pages/discounts";
import PatientsPage from "@/pages/patients";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/clinics" component={ClinicsPage} />
      <Route path="/offers" component={OffersPage} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/discounts" component={DiscountsPage} />
      <Route path="/patients" component={PatientsPage} />
      <Route>
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h2>
          <p className="text-muted-foreground mb-8">عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.</p>
          <a href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all">
            العودة للرئيسية
          </a>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster position="bottom-left" toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          borderRadius: '1rem',
          border: '1px solid hsl(var(--border))',
          fontFamily: 'Cairo',
          direction: 'rtl'
        }
      }} />
    </QueryClientProvider>
  );
}

export default App;
