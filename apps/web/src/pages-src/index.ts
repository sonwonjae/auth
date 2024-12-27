import type { Middleware, CustomIncomingMessage } from "@/middlewares/type";

import { pipe } from "@/middlewares/utils/pipe";

type Req = CustomIncomingMessage;

const redirect: Middleware<Req> = async () => {
  return {
    redirect: {
      destination: "/auth",
      permanent: true,
    },
  };
};

export const middleware = pipe<Req>(redirect);
