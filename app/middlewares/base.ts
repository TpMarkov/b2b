import { os } from "@orpc/server";

export const base = os.$context<{ request: Request }>().errors({
  RATE_LIMITED: {
    message: "You are being rate limited",
  },
  NOT_FOUND: {
    message: "Not found",
  },
  UNAUTHORIZED: {
    message: "You are not authorized",
  },
  BAD_REQUEST: {
    message: "Bad request",
  },
  FORBIDDEN: {
    message: "This is forbidden",
  },
  INTERNAL_SERVER_ERROR: {
    message: "Internal server error",
  },
});
