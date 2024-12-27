"use client";
import Image from "next/image";

import { cn } from "@/utils/tailwind";

function GoogleLogin() {
  return null;

  /** FIXME: 완성 못함 아직 Fade Out 처리해둠, API 완성 후 다시 오픈 예정 */
  return (
    <a
      href={`${process.env.NEXT_PUBLIC_API_SERVER_HOST}/google/login`}
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
      <Image
        src="/google.svg"
        width={20}
        height={18}
        alt="google login"
        priority
      />
      <span className={cn("flex-1", "flex", "items-center", "justify-center")}>
        구글 로그인
      </span>
    </a>
  );
}

export default GoogleLogin;
