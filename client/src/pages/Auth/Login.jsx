import { useAuthContext } from "@/context/AuthContext";
import LoginForm from "@/components/forms/LoginForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      await login(data);
      navigate("/", { replace: true });
    } catch (error) {
      // ...
    }
  };

  return (
    <>
      <div className='h-[10vh]'></div>
      <LoginForm onSubmit={handleLogin} />
    </>
  );
}
