import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import CourtTable from "./CourtTable";

function App() {
  return (
    <>
      <CourtTable />
    </>
  );
}

export default App;
