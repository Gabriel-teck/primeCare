import { redirect } from "next/navigation";

export default function LegacyChatsRedirect() {
  redirect("/admin-dashboard/chat");
}
