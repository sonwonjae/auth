import type { Middleware, CustomIncomingMessage } from "@/middlewares/type";

import { dehydrate, QueryClient } from "@tanstack/react-query";

import { pipe } from "@/middlewares/utils/pipe";
import { RQServer } from "@/utils/react-query";

type Req = CustomIncomingMessage;

const prefetch: Middleware<Req> = async (req, res) => {
  const accessToken =
    req.cookies?.[
      process.env.NEXT_PUBLIC_AUTH_ACCESS_TOKEN_COOKIE_NAME as string
    ];
  const refreshToken =
    req.cookies?.[
      process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_COOKIE_NAME as string
    ];

  if (!accessToken && !refreshToken) {
    return {
      props: {},
    };
  }
  const queryClient = new QueryClient();

  try {
    const authQuery = new RQServer({ url: "/api/user/auth/check", res });
    await queryClient.fetchQuery(authQuery.queryOptions);

    return {
      redirect: {
        destination: "/info",
        permanent: true,
      },
    };
  } catch {
    return {
      props: { dehydratedState: dehydrate(queryClient) },
    };
  }
};

export const middleware = pipe<Req>(prefetch);
