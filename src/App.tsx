import { RecordsTable } from "./components/RecordsTable";
import { records } from "./data";

export default function App() {
  return (
    <div className="container mx-auto">
      <RecordsTable records={records} />
    </div>
  );
}
