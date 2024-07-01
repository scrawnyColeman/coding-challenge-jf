import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import { RecordType, timezoneMap } from "../data";
import { parseLocalisedDate } from "../utils";
import { FC } from "react";
import { fromZonedTime } from "date-fns-tz";

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

export const getLocalRefundDateTime = (
  record: RecordType,
  timeZone: string
) => {
  const userRefundDateTime = buildDate(
    record.refundRequestDate,
    record.refundRequestTime,
    record.customerLocation
  );
  const localRefundDateTime = changeTimeZone(userRefundDateTime, {
    from: timeZone,
    to: "Europe/London",
  });

  if (record.requestSource === "phone") {
    const inputDate = new Date(localRefundDateTime);
    const day = inputDate.getDay();
    const hour = inputDate.getHours();

    if (day === 0 || day === 6 || hour < 9 || hour >= 17) {
      // Skip weekend and out of hours
      do {
        inputDate.setDate(inputDate.getDate() + 1);
      } while (inputDate.getDay() === 0 || inputDate.getDay() === 6);
      // If incrementing a day, always set the time to 9am
      inputDate.setHours(9, 0, 0, 0);
    }
    return inputDate;
  }

  return localRefundDateTime;
};

export const buildDate = (
  date: string,
  time: string,
  requesterLocale: string
): Date => {
  const [hour, minute] = time.split(":");

  // US
  if (requesterLocale.includes("US")) {
    const [month, day, year] = date.split("/");
    const paddedMonth = month.padStart(2, "0");
    const paddedDay = day.padStart(2, "0");
    const paddedHour = hour.padStart(2, "0");
    return new Date(
      `${year}-${paddedMonth}-${paddedDay}T${paddedHour}:${minute}:00`
    );
  }

  // Europe
  const [day, month, year] = date.split("/");
  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");
  const paddedHour = hour.padStart(2, "0");
  return new Date(
    `${year}-${paddedMonth}-${paddedDay}T${paddedHour}:${minute}:00`
  );
};

export const canRefund = (record: RecordType, timeZone: string) => {
  const isNewTOS =
    new Date(parseLocalisedDate(record.signUpDate, record.customerLocation)) >
    new Date("2020-01-02");

  const isPhoneRequest = record.requestSource === "phone";

  const investmentUserDateTime = buildDate(
    record.investmentDate,
    record.investmentTime,
    record.customerLocation
  );
  const investmentDateTime = changeTimeZone(investmentUserDateTime, {
    from: timeZone,
    to: "Europe/London",
  });

  const localRefundDateTime = getLocalRefundDateTime(record, timeZone)!;

  let hoursBuffer = 0;
  switch (true) {
    case isNewTOS && isPhoneRequest:
      hoursBuffer = 24;
      break;

    case isNewTOS && !isPhoneRequest:
      hoursBuffer = 16;
      break;

    case !isNewTOS && isPhoneRequest:
      hoursBuffer = 4;
      break;

    case !isNewTOS && !isPhoneRequest:
      hoursBuffer = 8;
      break;

    default:
      break;
  }

  const diffInMillis = Math.abs(
    investmentDateTime.valueOf() - localRefundDateTime.valueOf()
  );
  const hourDifferenceInMillis = hoursBuffer * 60 * 60 * 1000;

  return diffInMillis <= hourDifferenceInMillis;
};

export const changeTimeZone = (
  date: Date,
  timeZone: { from: string; to: string }
) => {
  return fromZonedTime(date, timeZone.from, {
    timeZone: timeZone.to,
  });
};
