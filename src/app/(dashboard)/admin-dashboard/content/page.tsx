"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { listContent, updateContent } from "@/lib/api/content";
import type { ContentBlock } from "@/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminContentPage() {
  const { token } = useAuth();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listContent();
      setBlocks(data || []);
    } catch {
      toast.error("Failed to load content");
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateBlock = (id: string, field: "title" | "body", value: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    );
  };

  const saveAll = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await Promise.all(
        blocks.map((block) =>
          updateContent(
            block.key,
            { title: block.title, body: block.body },
            token,
          ),
        ),
      );
      toast.success("Content saved");
      await load();
    } catch {
      toast.error("Could not save content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Content"
        description="Edit key landing-page copy blocks used across the public site."
        actions={
          <Button
            className="bg-green-700 hover:bg-green-600"
            disabled={saving || loading || blocks.length === 0}
            onClick={() => void saveAll()}
          >
            {saving ? "Saving…" : "Save all"}
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1d884a]" />
        </div>
      ) : blocks.length === 0 ? (
        <p className="text-sm text-gray-500">No content blocks found.</p>
      ) : (
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
                  <label className="mb-1 block text-sm text-gray-600">
                    Body
                  </label>
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
      )}
    </div>
  );
}
