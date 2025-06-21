import { useEffect } from "react";

function PersonalizationPage() {
  useEffect(() => {
    document.title = "Personalization - J.A.C.A.";
  }, []);
  return <div>PersonalizationPage</div>;
}

export default PersonalizationPage;
