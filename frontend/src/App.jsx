import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Careers from "./pages/Careers";
import ApplicationForm from "./pages/ApplicationForm";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyApplications from "./pages/MyApplications";

import AdminDashboard from "./pages/AdminDashboard";
import Applications from "./pages/Applications";
import ApplicantDetails from "./pages/ApplicantDetails";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">

      <Navbar />

      <main className="flex-1">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          <Route path="/careers" element={<Careers />} />

          <Route
            path="/careers/:jobSlug"
            element={<ApplicationForm />}
          />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />


          {/* Candidate Route */}
          <Route
            path="/my-applications"
            element={<MyApplications />}
          />


          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/applications/:id"
            element={
              <ProtectedRoute>
                <ApplicantDetails />
              </ProtectedRoute>
            }
          />


          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </main>

      <Footer />

    </div>
  );
}