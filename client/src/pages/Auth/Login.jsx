import LoginForm from "@/components/forms/LoginForm";

export default function Login() {
  return <LoginForm onSubmit={(data) => console.log(data)} />;
}