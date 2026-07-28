import { redirect } from "next/navigation";

export default function PaymentHistoryRedirect() {
  redirect("/patient-dashboard/care?tab=billing");
}
