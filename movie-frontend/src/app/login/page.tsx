import LoginForm from "../../components/forms/LoginForm";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "sonner";

const RegisterPage = () => {
  return (
    <AuthProvider>
      <div className="max-w-md mx-auto my-10">
        <LoginForm />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
};

export default RegisterPage;
