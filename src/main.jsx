import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify';
import { RouterProvider } from "react-router/dom";
import { router } from './routes/AppRoutes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer />
    </QueryClientProvider>
  </StrictMode>,
)