import RegisterForm from "@/components/forms/RegisterForm";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuthContext();
  const navigate = useNavigate();

  const handleRegister = async (data) => {
    try {
      await register(data);
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return <RegisterForm onSubmit={handleRegister} />;
}
