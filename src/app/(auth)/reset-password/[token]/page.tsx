import { getServerSession } from "next-auth";
import Form from "./form";
import { redirect } from "next/navigation";

interface ResetPasswordParams {
  token: string;
}

export default async function ResetPasswordPage({ params }: { params: ResetPasswordParams }) {
  return <Form token={params.token} />;
}
