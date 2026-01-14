import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Redirect to homepage contact section
    navigate('/#contact', { replace: true });
  }, [navigate]);
  return null;
};

export default Contact;
