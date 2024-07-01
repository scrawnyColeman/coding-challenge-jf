import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  RecordType,
  canRefund,
  getLocalRefundDateTime,
  timezoneMap,
} from "../data";
import { FC } from "react";

export const RecordsTable: FC<{ records: RecordType[] }> = ({ records }) => {
  const transformedRecords = records.map((record) => {
    const timeZone =
      timezoneMap[record.customerLocation as keyof typeof timezoneMap];

    return {
      ...record,
      localRefundDate: getLocalRefundDateTime(record, timeZone),
      isEligibleForRefund: canRefund(record, timeZone),
    };
  });

  return (
    <Table>
      <TableCaption>
        A list of investors and their refund eligibility.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Eligible?</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {transformedRecords.map((record) => (
          <TableRow key={record.name}>
            <TableCell className="font-medium">{record.name}</TableCell>
            <TableCell className="text-right">
              {record.isEligibleForRefund ? "Yes" : "No"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
