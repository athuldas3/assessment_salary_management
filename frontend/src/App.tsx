import { CircularProgress, Stack } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { EmployeesPage } from "./pages/EmployeesPage";
import { InsightsPage } from "./pages/InsightsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense
          fallback={
            <Stack alignItems="center" justifyContent="center" minHeight="100vh">
              <CircularProgress />
            </Stack>
          }
        >
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/employees" replace />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/insights" element={<InsightsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
