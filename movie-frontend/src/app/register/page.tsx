// pages/register.tsx
import RegisterForm from "../../components/forms/RegisterForm";
import { AuthProvider } from "../../context/AuthContext";
import { Toaster } from "sonner";

const RegisterPage = () => {
  return (
    <AuthProvider>
      <div className="max-w-md mx-auto my-5">
        <RegisterForm />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
};

export default RegisterPage;
