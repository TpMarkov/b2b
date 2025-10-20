import arcjet, { slidingWindow } from "@/lib/arcjet";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { base } from "../base";

const buildStandartAj = () =>
  arcjet.withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 180,
    })
  );

export const readSecurityMiddleware = base
  .$context<{
    request: Request;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decision = await buildStandartAj().protect(context.request, {
      userId: context.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: "Too many inpactual changes. Please slow down",
        });
      }

      throw errors.FORBIDDEN({
        message: "Request Blocked!",
      });
    }

    return next();
  });
