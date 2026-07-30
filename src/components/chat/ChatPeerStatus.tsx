"use client";

export function ChatPeerStatus({
  online,
  typing,
}: {
  online: boolean;
  typing?: boolean;
}) {
  if (typing) {
    return <p className="truncate text-xs text-green-700">Is typing…</p>;
  }
  return (
    <p
      className={`truncate text-xs ${
        online ? "text-green-700" : "text-gray-500"
      }`}
    >
      <span
        className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
          online ? "bg-green-600" : "bg-gray-400"
        }`}
      />
      {online ? "Online" : "Offline"}
    </p>
  );
}
