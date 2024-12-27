import type { CustomIncomingMessage } from "@/middlewares/type";
import type { ServerResponse } from "http";

import { useQuery } from "@tanstack/react-query";
import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/common/makeGetServerSideProps";
import { pipe } from "@/middlewares/utils/pipe";
import { middleware } from "@/pages-src/auth/info";
import { RQClient } from "@/utils/react-query";
import { cn } from "@/utils/tailwind";

const router = createRouter<CustomIncomingMessage, ServerResponse>();
router.get(pipe(middleware));

export const getServerSideProps = makeGetServerSideProps(router);

export default function InfoPage() {
  const authQuery = new RQClient({ url: "/api/user/auth/check" });
  const { data: userInfo } = useQuery(authQuery.queryOptions);

  return (
    <div
      className={cn(
        "grid",
        "grid-rows-[20px_1fr_20px]",
        "items-center",
        "justify-items-center",
        "min-h-screen",
        "p-8",
        "pb-20",
        "gap-16",
        "sm:p-20",
        "font-[family-name:var(--font-geist-sans)]",
      )}
    >
      <main
        className={cn(
          "flex",
          "flex-col",
          "gap-4",
          "row-start-2",
          "items-center",
          "justify-center",
          "max-w-80",
          "w-full",
        )}
      >
        <section
          className={cn(
            "flex",
            "gap-4",
            "items-center",
            "justify-center",
            "max-w-80",
            "w-full",
          )}
        >
          <h2>{userInfo?.name}님 안녕하세요.</h2>
        </section>
        <section
          className={cn(
            "flex",
            "flex-col",
            "gap-2",
            "items-center",
            "max-w-80",
            "w-full",
          )}
        >
          <a
            href={`${process.env.NEXT_PUBLIC_API_SERVER_HOST}/api/user/auth/logout`}
            className={cn(
              "flex",
              "items-center",
              "justify-center",
              "py-3",
              "px-6",
              "bg-white",
              "w-full",
              "text-black",
              "rounded-xl",
            )}
          >
            로그아웃
          </a>
        </section>
      </main>
    </div>
  );
}
