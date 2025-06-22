import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { FaEnvelope, FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { MdWeb } from "react-icons/md";

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
        <Button variant="outline" className="w-full" asChild>
          <a href="https://github.com/Kalpak43" target="_blank">
            <FaGithub /> Github
          </a>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <a href="mailto:kalpakgoshikwar123@gmail.com" target="_blank">
            <FaEnvelope /> Email
          </a>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <a href="https://x.com/kalpak935992463" target="_blank">
            <FaXTwitter /> X (Twitter)
          </a>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <a
            href="https://www.linkedin.com/in/kalpakgoshikwar/"
            target="_blank"
          >
            <FaLinkedin /> Linkedin
          </a>
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="font-newsreader text-xl font-[400]">Also Explore</h4>
        <Button variant="outline" className="w-full" asChild>
          <a href="https://kalpak-goshikwar.vercel.app/" target="_blank">
            <MdWeb /> Portfolio
          </a>
        </Button>
      </div>
    </section>
  );
}

export default ContactUsPage;
