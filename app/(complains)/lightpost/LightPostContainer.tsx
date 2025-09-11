import { useState } from "react";
import LightPostDetailList from "./LightPostDetailList";
import LightPostSummaryList from "./LightPostSummayList";

export default function LightPostContainer({ postNo }: { postNo: string }) {
  const [view, setView] = useState("summary");
  const [selectedName, setSelectedName] = useState("");

  function selectComplainSummary(name: string) {
    setSelectedName(name);
    setView("detail");
  }

  console.log("postnox", postNo);

  return (
    <>
      {view === "summary" && (
        <LightPostSummaryList
          postNo={postNo}
          selectComplainSummary={selectComplainSummary}
        />
      )}
      {view === "detail" && (
        <LightPostDetailList postNo={postNo} name={selectedName} />
      )}
    </>
  );
}
