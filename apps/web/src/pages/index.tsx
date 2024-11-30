import type { CustomIncomingMessage } from "@/middlewares/type";
import type { ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/common/makeGetServerSideProps";
import { pipe } from "@/middlewares/utils/pipe";
import { middleware } from "@/pages-src/index";
import { GoogleLogin } from "@/pages-src/index/components/GoogleLogin";
import { KakaoLogin } from "@/pages-src/index/components/KakaoLogin";
import { cn } from "@/utils/tailwind";

const router = createRouter<CustomIncomingMessage, ServerResponse>();
router.get(pipe(middleware));

export const getServerSideProps = makeGetServerSideProps(router);

export default function HomePage() {
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
          <h2>통합 로그인</h2>
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
          <KakaoLogin />
          <GoogleLogin />
        </section>
      </main>
    </div>
  );
}
