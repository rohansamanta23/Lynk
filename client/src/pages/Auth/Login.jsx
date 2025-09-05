import { useAuthContext } from "@/context/AuthContext";
import LoginForm from "@/components/forms/LoginForm";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuthContext();


  const handleLogin = async (data) => {
    try {
      await login(data);
    } catch (error) {
      console.error(error);
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
