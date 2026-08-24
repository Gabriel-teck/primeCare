"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitContact } from "@/lib/api/contact";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fieldClass =
  "h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-[#212529] shadow-none outline-none placeholder:text-gray-400 focus-visible:border-green-700 focus-visible:ring-1 focus-visible:ring-green-700";

export default function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || message.trim().length < 5) {
      toast.error("Please fill in your name, email, and a short message.");
      return;
    }

    setSending(true);
    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      toast.success("Message sent. We’ll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message || "Could not send your message. Please try again.");
      console.error("Contact form submit failed:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      className="scroll-mt-24 md:scroll-mt-28 w-full mt-16 md:mt-24 pb-16 md:pb-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-16">
          <div className="md:w-1/2 md:max-w-xl">
            <h2 className="text-[32px] font-semibold tracking-normal text-[#333]">
              Get In Touch
            </h2>
            <p className="mt-4 text-[14px] font-normal leading-6 tracking-tight text-[#828282]">
              If you’re a patient looking for precise and convenient healthcare
              options accessible from the comfort of your home, or a
              practitioner looking for new professional opportunities, get in
              touch to learn more about PrimeCare. We’re here to answer
              questions and walk you through a complete demonstration of the
              platform.
            </p>
          </div>

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="flex w-full flex-col gap-3 md:w-1/2 md:max-w-lg"
          >
            <Input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(fieldClass, "shadow-none")}
              required
              disabled={sending}
            />
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(fieldClass, "shadow-none")}
              required
              disabled={sending}
            />
            <textarea
              name="message"
              placeholder="Message for PrimeCare"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className={cn(
                fieldClass,
                "h-auto min-h-[120px] resize-y py-3 shadow-none",
              )}
              required
              minLength={5}
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={sending}
              className="h-11 w-full cursor-pointer rounded-md bg-[#1d884a] text-base font-semibold text-white hover:bg-green-700"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
