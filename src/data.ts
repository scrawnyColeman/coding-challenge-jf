import { fromZonedTime } from "date-fns-tz";

export type RecordType = {
  name: string;
  customerLocation: string;
  signUpDate: string;
  requestSource: "phone" | "web app";
  investmentDate: string;
  investmentTime: string;
  refundRequestDate: string;
  refundRequestTime: string;
};

export const records: RecordType[] = [
  {
    name: "Emma Smith",
    customerLocation: "US (PST)",
    signUpDate: "1/2/2020",
    requestSource: "phone",
    investmentDate: "1/2/2021",
    investmentTime: "06:00",
    refundRequestDate: "1/2/2021",
    refundRequestTime: "09:00",
  },
  {
    name: "Benjamin Johnson",
    customerLocation: "Europe (CET)",
    signUpDate: "12/2/2020",
    requestSource: "web app",
    investmentDate: "2/1/2021",
    investmentTime: "06:30",
    refundRequestDate: "1/2/2021",
    refundRequestTime: "23:00",
  },
  {
    name: "Olivia Davis",
    customerLocation: "Europe (CET)",
    signUpDate: "1/2/2020",
    requestSource: "web app",
    investmentDate: "2/2/2021",
    investmentTime: "13:00",
    refundRequestDate: "2/2/2021",
    refundRequestTime: "20:00",
  },
  {
    name: "Ethan Anderson",
    customerLocation: "US (PST)",
    signUpDate: "1/11/2011",
    requestSource: "web app",
    investmentDate: "2/1/2021",
    investmentTime: "13:00",
    refundRequestDate: "2/2/2021",
    refundRequestTime: "16:00",
  },
  {
    name: "Sophia Wilson",
    customerLocation: "US (PST)",
    signUpDate: "2/1/2020",
    requestSource: "phone",
    investmentDate: "2/1/2021",
    investmentTime: "22:00",
    refundRequestDate: "2/2/2021",
    refundRequestTime: "5:00",
  },
  {
    name: "Liam Martinez",
    customerLocation: "Europe (GMT)",
    signUpDate: "1/1/2020",
    requestSource: "web app",
    investmentDate: "1/1/2021",
    investmentTime: "11:00",
    refundRequestDate: "11/1/2021",
    refundRequestTime: "12:00",
  },
  {
    name: "Jonathan Giles",
    customerLocation: "Europe (CET)",
    signUpDate: "1/1/2020",
    requestSource: "phone",
    investmentDate: "1/1/2021",
    investmentTime: "11:00",
    refundRequestDate: "12/1/2021",
    refundRequestTime: "12:00",
  },
  {
    name: "Priya Sharp",
    customerLocation: "Europe (CET)",
    signUpDate: "10/10/2020",
    requestSource: "phone",
    investmentDate: "5/5/2021",
    investmentTime: "00:30",
    refundRequestDate: "5/5/2021",
    refundRequestTime: "21:00",
  },
  {
    name: "Raja Ortiz",
    customerLocation: "US (EST)",
    signUpDate: "10/10/2021",
    requestSource: "phone",
    investmentDate: "01/15/2022",
    investmentTime: "21:30",
    refundRequestDate: "01/16/2022",
    refundRequestTime: "07:00",
  },
  {
    name: "Livia Burns",
    customerLocation: "US (PST)",
    signUpDate: "10/10/2021",
    requestSource: "phone",
    investmentDate: "01/15/2022",
    investmentTime: "21:30",
    refundRequestDate: "01/16/2022",
    refundRequestTime: "19:00",
  },
  {
    name: "Lacey Gates",
    customerLocation: "Europe (CET)",
    signUpDate: "10/10/2021",
    requestSource: "web app",
    investmentDate: "15/01/2022",
    investmentTime: "23:36",
    refundRequestDate: "16/01/2022",
    refundRequestTime: "13:12",
  },
];

export const timezoneMap = {
  "US (PST)": "America/Los_Angeles",
  "Europe (CET)": "Europe/Paris",
  "Europe (GMT)": "Europe/London",
  "US (EST)": "America/New_York",
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

export const parseLocalisedDate = (date: string, location: string) => {
  if (location.includes("US")) {
    const [month, day, year] = date.split("/");
    return `${year}-${month}-${day}`;
  }
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
};
