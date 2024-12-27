import type { CustomIncomingMessage } from "@/middlewares/type";
import type { ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/common/makeGetServerSideProps";
import { pipe } from "@/middlewares/utils/pipe";
import { middleware } from "@/pages-src/auth/index";

const router = createRouter<CustomIncomingMessage, ServerResponse>();
router.get(pipe(middleware));

export const getServerSideProps = makeGetServerSideProps(router);

export default function HomePage() {
  return null;
}
