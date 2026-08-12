import React from "react";

const V3App = React.lazy(() => import("./v3/V3App").then((module) => ({ default: module.V3App })));
const LegacyApp = React.lazy(() => import("./legacy/LegacyApp"));
const CoupleApp = React.lazy(() => import("./couple/CoupleApp").then((module) => ({ default: module.CoupleApp })));

function useLegacyApp(): boolean {
  const params = new URLSearchParams(window.location.search);
  const legacyPaths = ["/artykuly", "/regulamin", "/polityka-prywatnosci", "/rodo", "/kontakt"];
  return params.get("legacy") === "1" || legacyPaths.some((path) => window.location.pathname.startsWith(path));
}

export default function App() {
  const isCouple = window.location.pathname.startsWith("/dla-par");
  const AppComponent = isCouple ? CoupleApp : useLegacyApp() ? LegacyApp : V3App;

  return (
    <React.Suspense fallback={<div style={{ minHeight: "100vh", background: "#050505" }} />}>
      <AppComponent />
    </React.Suspense>
  );
}
