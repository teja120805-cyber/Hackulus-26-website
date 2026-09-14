import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { ZoneDetail } from "./pages/ZoneDetail";
import { Safety } from "./pages/Safety";
import { Network } from "./pages/Network";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { Demo } from "./pages/Demo";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/zones/:id" element={<ZoneDetail />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/network" element={<Network />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/demo" element={<Demo />} />
      </Route>
    </Routes>
  );
}

export default App;
