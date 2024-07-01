import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/table";

import { convertDateToUk, records, RecordType } from "./data";
import { parseLocalisedDate } from "./utils";

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
            <TableHead className="text-right">Eligible?</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((record) => {
            const ukRequestTime = parseRequestDate(record);

            const isNewTOS =
              new Date(
                parseLocalisedDate(record.signUpDate, record.customerLocation)
              ) >= new Date("2020-01-02");

            return (
              <TableRow key={record.name}>
                <TableCell className="font-medium">{record.name}</TableCell>
                <TableCell>{record.customerLocation}</TableCell>
                <TableCell>{`${isNewTOS}`}</TableCell>
                <TableCell>
                  {ukRequestTime?.toLocaleString("en-GB", {
                    timeZone: "Europe/London",
                    timeZoneName: "long",
                  })}
                  {/* TODO: Revisit this. May only work for local */}
                </TableCell>
                <TableCell className="text-right">
                  {canRefund(record) ? "Yes" : "No"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

const parseRequestDate = (record: RecordType) => {
  const ukDate = convertDateToUk(
    buildDate(
      record.refundRequestDate.padStart(2, "0"),
      record.refundRequestTime.padStart(2, "0"),
      record.customerLocation
    ),
    record.customerLocation
  );

  console.log({ ukDate });

  if (record.requestSource === "web app") {
    return ukDate;
  }

  if (record.requestSource === "phone") {
    const inputDate = new Date(ukDate);
    const day = inputDate.getDay();
    const hour = inputDate.getHours();

    if (day === 0 || day === 6 || hour < 9 || hour >= 17) {
      do {
        inputDate.setDate(inputDate.getDate() + 1);
      } while (inputDate.getDay() === 0 || inputDate.getDay() === 6);
      inputDate.setHours(9, 0, 0, 0);
    }
    return inputDate;
  }
};

const buildDate = (
  date: string,
  time: string,
  requesterLocale: string
): Date => {
  const [hour, minute] = time.split(":");

  if (requesterLocale.includes("US")) {
    const [month, day, year] = date.split("/");
    return new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}T${hour.padStart(2, "0")}:${minute}:00`
    );
  }

  const [day, month, year] = date.split("/");
  return new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(
      2,
      "0"
    )}:${minute}:00`
  );
};

const canRefund = (record: RecordType) => {
  const isNewTOS =
    new Date(parseLocalisedDate(record.signUpDate, record.customerLocation)) >
    new Date("2020-01-02");

  const isPhoneRequest = record.requestSource === "phone";

  const investmentDateTime = convertDateToUk(
    buildDate(
      record.investmentDate,
      record.investmentTime,
      record.customerLocation
    ),
    record.customerLocation
  );
  const refundDateTime = parseRequestDate(record)!;

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
    investmentDateTime.valueOf() - refundDateTime.valueOf()
  );
  const hourDifferenceInMillis = hoursBuffer * 60 * 60 * 1000;

  return diffInMillis <= hourDifferenceInMillis;
};
