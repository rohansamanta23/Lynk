import RegisterForm from "@/components/forms/RegisterForm";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();

  const handleRegister = async (data) => {
    try {
      const res = await register(data);
      toast.success(res.message || "Registration successful! Welcome 🎉");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      toast.error(msg);
    }
  };

  return <RegisterForm onSubmit={handleRegister} />;
}
