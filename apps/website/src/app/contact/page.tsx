import React from "react";
import { ContactForm } from "../../features/landing/_components/ContactForm";

export default function ContactPage() {
  return (
    <div className="w-full bg-white min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-full py-12">
        <ContactForm />
      </div>
    </div>
  );
}
