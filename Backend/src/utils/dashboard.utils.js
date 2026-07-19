import mongoose from "mongoose";

const toNumberOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const isValidDate = (d) => {
  const x = d instanceof Date ? d : new Date(d);
  return !Number.isNaN(x.getTime());
};

const getLocalDayBounds = (d = new Date()) => {
  // Use server local time boundaries so “today” matches runtime expectations.
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);

  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const startOfWeek = (d = new Date()) => {
  // Week starts Monday.
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getWeekBounds = (d = new Date()) => {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getMonthBounds = (d = new Date()) => {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getYearBounds = (d = new Date()) => {
  const start = new Date(d.getFullYear(), 0, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(d.getFullYear(), 11, 31);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getCustomBounds = (startDate, endDate) => {
  const s = isValidDate(startDate) ? new Date(startDate) : null;
  const e = isValidDate(endDate) ? new Date(endDate) : null;
  if (!s || !e) return null;

  s.setHours(0, 0, 0, 0);
  e.setHours(23, 59, 59, 999);

  return { start: s, end: e };
};

export const getDateRange = ({ range, startDate, endDate } = {}) => {
  const r = (range || "").toString().toLowerCase().trim();

  const now = new Date();

  if (!r || r === "today") return getLocalDayBounds(now);
  if (r === "week" || r === "thisweek") return getWeekBounds(now);
  if (r === "month" || r === "thismonth") return getMonthBounds(now);
  if (r === "year" || r === "thisyear") return getYearBounds(now);

  if (r === "custom") {
    return getCustomBounds(startDate, endDate);
  }

  // Fallback to today
  return getLocalDayBounds(now);
};

export const parseOptionalObjectId = (value) => {
  if (!value) return null;
  if (!mongoose.isValidObjectId(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

export const getRangeMatch = ({ dateField = "createdAt", rangeObj } = {}) => {
  if (!rangeObj?.start || !rangeObj?.end) return {};
  return {
    [dateField]: {
      $gte: rangeObj.start,
      $lte: rangeObj.end,
    },
  };
};

// Revenue is derived from Payment.amount.
// We treat paymentStatuses as:
// - success: Paid, Captured
// - failure: Failed
// - refunded: Refunded
// The project also has order-level statuses; dashboard revenue focuses on Payment.
export const PAYMENT_STATUS = {
  SUCCESS: ["Paid", "Captured"],
  FAILED: ["Failed"],
  REFUNDED: ["Refunded", "Partially Refunded"],
  PENDING: ["Pending", "Created", "Authorized"],
};

export const buildRevenueAggregation = ({ match, successStatuses } = {}) => {
  const statuses = successStatuses && successStatuses.length ? successStatuses : PAYMENT_STATUS.SUCCESS;

  return [
    { $match: { ...match, paymentStatus: { $in: statuses } } },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$amount" },
      },
    },
  ];
};

export const buildCountByStatusAggregation = ({ match = {}, statusField } = {}) => {
  return [
    { $match: match },
    {
      $group: {
        _id: `$${statusField}`,
        count: { $sum: 1 },
      },
    },
  ];
};

export const toBucketKey = (dateExpr, unit) => {
  // Returns date key for grouping.
  // unit: "day" => YYYY-MM-DD
  // unit: "month" => YYYY-MM
  // unit: "year" => YYYY
  if (unit === "day") {
    return { $dateToString: { format: "%Y-%m-%d", date: dateExpr } };
  }
  if (unit === "month") {
    return { $dateToString: { format: "%Y-%m", date: dateExpr } };
  }
  return { $dateToString: { format: "%Y", date: dateExpr } };
};

export const buildTimeSeriesAggregation = ({
  match = {},
  dateField = "createdAt",
  bucketUnit = "day",
  valueField = null,
  statuses = null,
} = {}) => {
  const pipeline = [];

  if (statuses?.length) {
    pipeline.push({ $match: { ...match, paymentStatus: { $in: statuses } } });
  } else {
    pipeline.push({ $match: match });
  }

  const keyExpr = toBucketKey(`$${dateField}`, bucketUnit);

  pipeline.push(
    {
      $group: {
        _id: keyExpr,
        count: valueField ? undefined : { $sum: 1 },
        revenue: valueField ? { $sum: valueField } : undefined,
      },
    }
  );

  // Normalize fields after conditional undefined above
  pipeline.push({
    $project: {
      _id: 0,
      key: "$_id",
      count: valueField ? { $ifNull: ["$count", 0] } : "$count",
      value: valueField ? "$revenue" : "$count",
    },
  });

  pipeline.push({ $sort: { key: 1 } });

  return pipeline;
};

