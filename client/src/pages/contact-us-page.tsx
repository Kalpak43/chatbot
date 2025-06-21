import { Button } from "@/components/ui/button";
import { Github, Globe2, Linkedin, Mail, Twitter } from "lucide-react";
import { useEffect } from "react";

function ContactUsPage() {
  useEffect(() => {
    document.title = "Contact Us - J.A.C.A.";
  }, []);

  return (
    <section id="contact-us" className="space-y-8">
      <div>
        <h2 className="font-newsreader text-3xl font-[400]">
          Have questions, feedback, or feature ideas? Let me know!
        </h2>
        <p>You can contact me via:</p>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-4">
        <Button variant="outline" className="w-full">
          <Github /> Github
        </Button>
        <Button variant="outline" className="w-full">
          <Mail /> Email
        </Button>
        <Button variant="outline" className="w-full">
          <Twitter /> X (Twitter)
        </Button>
        <Button variant="outline" className="w-full">
          <Linkedin /> Linkedin
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="font-newsreader text-xl font-[400]">
          Also Explore
        </h4>
        <Button variant="outline" className="w-full">
          <Globe2 /> Portfolio
        </Button>
      </div>
    </section>
  );
}

export default ContactUsPage;
