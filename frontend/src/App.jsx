import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import MainLayout from './layouts/main-layout';
import ProtectedRoute from './components/protected-route';
import Login from './pages/login';
import Signup from './pages/signup';
import Todos from './pages/todos';

const client = new QueryClient();

function RedirectToLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
  }, []);

  return <></>;
}

function App() {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectToLogin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/todos" element={<MainLayout />}>
            <Route
              // Use 'index' instead of duplicating /todos`
              index
              element={
                <ProtectedRoute>
                  <Todos />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Fallback Route */}
          <Route
            path="*"
            element={
              <div className="text-center mt-10 text-red-500 text-3xl">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
