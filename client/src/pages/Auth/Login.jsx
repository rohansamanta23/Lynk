
import LoginForm from "@/components/forms/LoginForm";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();

  const handleLogin = async (data) => {
    try {
      const res = await login(data);
      toast.success(res.message || "Logged in successfully!");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please try again.";
      toast.error(msg);
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
