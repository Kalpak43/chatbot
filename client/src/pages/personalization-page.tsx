import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getUserDetails, saveUserDetails } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const validationSchema = Yup.object({
  name: Yup.string().max(50, "Name must be 50 characters or less"),
  profession: Yup.string().max(50, "Profession must be 50 characters or less"),
  extra: Yup.string().max(300, "Info must be 300 characters or less"),
});

function PersonalizationPage() {
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const [userDetailsLoading, setUserDetailsLoading] = useState(true);

  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    document.title = "Personalization - J.A.C.A.";
  }, []);

  useEffect(() => {
    async function fetchDetails() {
      setUserDetailsLoading(true);
      const data = await getUserDetails();

      setUserDetails(data.data.details);
      console.log(data.data.details);
      setUserDetailsLoading(false);
    }

    if (user) fetchDetails();
  }, [user]);

  return (
    <section id="personalization" className="space-y-8">
      <div>
        <h2 className="font-newsreader text-3xl font-[400]">
          Personalize J.A.C.A.
        </h2>
      </div>

      {loading || userDetailsLoading ? (
        <p>Loading...</p>
      ) : userDetails ? (
        <PersonalizationForm userDetails={userDetails} />
      ) : (
        <p>Loading...</p>
      )}
    </section>
  );
}

export default PersonalizationPage;

function PersonalizationForm({
  userDetails,
}: {
  userDetails: { name: string; role: string; extra: string };
}) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: userDetails.name ?? "",
      profession: userDetails.role ?? "",
      extra: userDetails.extra ?? "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const { success } = await saveUserDetails({
        name: values.name,
        role: values.profession,
        extra: values.extra,
      });

      if (success) {
        toast.success("Saved user preference");
      } else {
        toast.error("Failed to save user preference");
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">What should J.A.C.A. call you?</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm">{formik.errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profession">What do you do?</Label>
          <Input
            id="profession"
            name="profession"
            placeholder="Engineer, Student, etc."
            value={formik.values.profession}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.profession && formik.errors.profession && (
            <p className="text-red-500 text-sm">{formik.errors.profession}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="extra">
            Anything else J.A.C.A. should know about you?
          </Label>
          <Textarea
            id="extra"
            name="extra"
            value={formik.values.extra}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.extra && formik.errors.extra && (
            <p className="text-red-500 text-sm">{formik.errors.extra}</p>
          )}
        </div>

        <div className="text-right">
          <Button type="submit" disabled={!formik.dirty || formik.isSubmitting}>
            {formik.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Save Preference"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
