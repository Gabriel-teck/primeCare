import { redirect } from "next/navigation";

export default function LegacySettingRedirect() {
  redirect("/admin-dashboard/settings");
}
