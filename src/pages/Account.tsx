import { Navigate } from "react-router-dom";

// Legacy route kept only to redirect deep links back to the modal flow
export default function Account() {
  return <Navigate to="/?openAccount=1" replace />;
}
