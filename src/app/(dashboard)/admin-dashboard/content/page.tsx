"use client";

import { useState } from "react";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockContent } from "@/lib/admin/mock-data";
import { toast } from "sonner";

export default function AdminContentPage() {
  const [blocks, setBlocks] = useState(mockContent);

  const updateBlock = (id: string, field: "title" | "body", value: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    );
  };

  return (
    <div>
      <AdminPageHeader
        title="Content"
        description="Edit key landing-page copy blocks used across the public site."
        actions={
          <Button
            className="bg-green-700 hover:bg-green-600"
            onClick={() => toast.success("Content saved (mock)")}
          >
            Save all
          </Button>
        }
      />

      <div className="space-y-4">
        {blocks.map((block) => (
          <AdminSectionCard
            key={block.id}
            title={block.key}
            description="Structured content block"
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Title
                </label>
                <Input
                  value={block.title}
                  onChange={(e) =>
                    updateBlock(block.id, "title", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Body</label>
                <textarea
                  value={block.body}
                  onChange={(e) =>
                    updateBlock(block.id, "body", e.target.value)
                  }
                  className="min-h-24 w-full rounded-md border border-gray-200 p-3 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
                />
              </div>
            </div>
          </AdminSectionCard>
        ))}
      </div>
    </div>
  );
}
