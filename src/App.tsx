import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/table";

import { records } from "./data";

export default function App() {
  return (
    <div className="container mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Investor Name</TableHead>
          </TableRow>
          <TableBody>
            {records.map((record) => {
              return (
                <TableRow>
                  <TableCell>{record.name}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableHeader>
      </Table>
    </div>
  );
}
