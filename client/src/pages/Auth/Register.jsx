import RegisterForm from "@/components/forms/RegisterForm";

export default function Register() {
  return <RegisterForm onSubmit={(data) => console.log(data)} />;
}
