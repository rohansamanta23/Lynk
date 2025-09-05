import RegisterForm from "@/components/forms/RegisterForm";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuthContext();

  const handleRegister = async (data) => {
    try {
      await register(data);
    } catch (error) {
      console.error(error);
    }
  };

  return <RegisterForm onSubmit={handleRegister} />;
}
