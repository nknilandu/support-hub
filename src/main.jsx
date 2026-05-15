import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Home from '../pages/Home/Home';
import LoginPage from '../pages/auth/Login/Login';
import RegisterPage from '../pages/auth/Register/Register';
import ForgotPassword from '../pages/auth/ForgotPassword/ForgotPassword';

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home
  },
  {
    path: "/login",
    Component: LoginPage
  },
  {
    path: "/register",
    Component: RegisterPage
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
