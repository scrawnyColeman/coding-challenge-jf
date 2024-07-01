import { describe, expect, it } from "vitest";
import {
  RecordType,
  buildDate,
  canRefund,
  changeTimeZone,
  parseLocalisedDate,
} from "./data";

describe("buildDate", () => {
  it("should build a date in US format", () => {
    const date = "12/31/2022";
    const time = "23:59";
    const requesterLocale = "US";

    const result = buildDate(date, time, requesterLocale);

    expect(result.getFullYear()).toBe(2022);
    expect(result.getMonth()).toBe(11); // 11 represents December (0-based index)
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
  });

  it("should build a date in European format", () => {
    const date = "31/12/2022";
    const time = "23:59";
    const requesterLocale = "Europe";

    const result = buildDate(date, time, requesterLocale);

    expect(result.getFullYear()).toBe(2022);
    expect(result.getMonth()).toBe(11); // 11 represents December (0-based index)
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
  });
});

describe("changeTimeZone", () => {
  it("should change the time zone of a date", () => {
    const date = new Date("2022-01-01T00:00:00Z");
    const timeZone = { from: "America/New_York", to: "Europe/London" };

    const result = changeTimeZone(date, timeZone);

    expect(result.toISOString()).toBe("2022-01-01T05:00:00.000Z");
  });

  it("should change the time zone of a date", () => {
    const date = new Date("2022-01-01T00:00:00Z");
    const timeZone = { from: "America/Los_Angeles", to: "Europe/London" };

    const result = changeTimeZone(date, timeZone);

    expect(result.toISOString()).toBe("2022-01-01T08:00:00.000Z");
  });

  it("should change the time zone of a date", () => {
    const date = new Date("2022-01-01T00:00:00Z");
    const timeZone = { from: "Europe/Paris", to: "Europe/London" };

    const result = changeTimeZone(date, timeZone);

    expect(result.toISOString()).toBe("2021-12-31T23:00:00.000Z");
  });
});

describe("canRefund", () => {
  it("should return true when the record is eligible for refund", () => {
    const record = {
      name: "Olivia Davis",
      customerLocation: "Europe (CET)",
      signUpDate: "1/2/2020",
      requestSource: "web app",
      investmentDate: "2/2/2021", // New TOS
      investmentTime: "13:00",
      refundRequestDate: "2/2/2021",
      refundRequestTime: "20:00", // Within 24 hours
    } as RecordType;
    const timeZone = "America/New_York";

    const result = canRefund(record, timeZone);

    expect(result).toBe(true);
  });

  it("should return false when the record is not eligible for refund", () => {
    const record = {
      name: "Ethan Anderson",
      customerLocation: "US (PST)",
      signUpDate: "1/11/2011",
      requestSource: "web app",
      investmentDate: "2/1/2021", // New TOS
      investmentTime: "13:00",
      refundRequestDate: "2/2/2021", // More than 16 hours
      refundRequestTime: "16:00",
    } as RecordType;
    const timeZone = "Europe/Paris";

    const result = canRefund(record, timeZone);

    expect(result).toBe(false);
  });
});

describe("parseLocalisedDate", () => {
  it("should parse a date in US format", () => {
    const date = "12/31/2022";
    const location = "US";

    const result = parseLocalisedDate(date, location);

    expect(result).toBe("2022-12-31");
  });

  it("should parse a date in European format", () => {
    const date = "31/12/2022";
    const location = "Europe";

    const result = parseLocalisedDate(date, location);

    expect(result).toBe("2022-12-31");
  });
});
