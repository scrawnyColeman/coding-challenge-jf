import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/table";

import { records } from "./data";
import { humanizeDate } from "./utils";

export default function App() {
  return (
    <div className="container mx-auto">
      <Table>
        <TableCaption>
          A list of investors and their refund eligibility.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Signed up</TableHead>
            <TableHead className="text-right">Source</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((record) => {
            return (
              <TableRow key={record.name}>
                <TableCell className="font-medium">{record.name}</TableCell>
                <TableCell>{record.customerLocation}</TableCell>
                <TableCell>
                  {humanizeDate(record.signUpDate, record.customerLocation)}
                </TableCell>
                <TableCell className="text-right">
                  {record.requestSource}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
