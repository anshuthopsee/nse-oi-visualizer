import { Routes, Route, Navigate } from "react-router-dom";
import Layout from './components/Layout';
import OpenInterest from './components/OpenInterest';
import StrategyBuilder from "./components/StrategyBuilder";
import ToastContextProvider from "./contexts/ToastContextProvider";
import Toast from "./components/Common/Toast";

function App() {
  return (
    <ToastContextProvider>
      <Toast />
      <Routes>
        <Route path="/*" element={<Layout />}>
          <Route index element={<Navigate to="/open-interest" />} />
          <Route path="open-interest" element={<OpenInterest />} />
          <Route path="strategy-builder" element={<StrategyBuilder />} />
        </Route>
      </Routes>
    </ToastContextProvider>
  );
};

export default App;
