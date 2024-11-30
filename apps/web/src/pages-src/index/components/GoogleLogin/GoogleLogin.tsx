"use client";
import Image from "next/image";

import { cn } from "@/utils/tailwind";

function GoogleLogin() {
  return (
    <button
      type="button"
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
        alt="kakao login"
        priority
      />
      <span className={cn("flex-1")}>구글 로그인</span>
    </button>
  );
}

export default GoogleLogin;
