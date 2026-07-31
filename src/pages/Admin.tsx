import React from "react";
import { useNavigate } from "react-router-dom";
import AdminPanel from "@/components/AdminPanel";

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  return <AdminPanel isOpen={true} onClose={() => navigate("/")} />;
};

export default AdminPage;
