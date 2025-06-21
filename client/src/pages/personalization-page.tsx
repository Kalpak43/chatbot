import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string().max(50, "Name must be 50 characters or less"),
  profession: Yup.string().max(50, "Profession must be 50 characters or less"),
  extra: Yup.string().max(300, "Info must be 300 characters or less"),
});

function PersonalizationPage() {
  useEffect(() => {
    document.title = "Personalization - J.A.C.A.";
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      profession: "",
      extra: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Submitted Values:", values);
    },
  });

  return (
    <section id="personalization" className="space-y-8">
      <div>
        <h2 className="font-newsreader text-3xl font-[400]">
          Personalize J.A.C.A.
        </h2>
      </div>

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
          <Button type="submit">Save Preference</Button>
        </div>
      </form>
    </section>
  );
}

export default PersonalizationPage;
