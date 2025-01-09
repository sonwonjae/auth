import Image from "next/image";

import { cn } from "@/utils/tailwind";

function KakaoLogin() {
  return (
    <a
      href={`${process.env.HOST}/api/user/kakao/login`}
      className={cn(
        "flex",
        "items-center",
        "justify-center",
        "py-3",
        "px-6",
        "bg-[#FEE500]",
        "w-full",
        "text-black",
        "rounded-xl",
      )}
    >
      <Image
        src="/kakao.svg"
        width={20}
        height={18}
        alt="kakao login"
        priority
      />
      <span className={cn("flex-1", "flex", "items-center", "justify-center")}>
        카카오 로그인
      </span>
    </a>
  );
}

export default KakaoLogin;
