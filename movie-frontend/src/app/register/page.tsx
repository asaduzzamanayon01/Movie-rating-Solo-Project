// pages/register.tsx
import RegisterForm from "../../components/forms/RegisterForm";
import { AuthProvider } from "../../context/AuthContext";
import { ToastContainer } from "react-toastify";

const RegisterPage = () => {
  return (
    <AuthProvider>
      <div className="max-w-md mx-auto my-5">
        <RegisterForm />
        <ToastContainer position="top-right" />
      </div>
    </AuthProvider>
  );
};

export default RegisterPage;
