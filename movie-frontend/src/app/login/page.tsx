import LoginForm from "../../components/forms/LoginForm";
import { AuthProvider } from "../../context/AuthContext";
import { ToastContainer } from "react-toastify";

const RegisterPage = () => {
  return (
    <AuthProvider>
      <div className="max-w-md mx-auto my-10">
        <LoginForm />
        <ToastContainer position="top-right" />
      </div>
    </AuthProvider>
  );
};

export default RegisterPage;
