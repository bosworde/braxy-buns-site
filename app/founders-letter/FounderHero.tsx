"use client";

import { motion } from "framer-motion";

const AUTISM_GRADIENT =
  "linear-gradient(90deg,#E40303 0%,#FF8C00 18%,#FFED00 34%,#008026 50%,#004DFF 68%,#750787 100%)";

const LOGO_SRC = "/braxy-buns-logo.png";

export default function FounderHero() {
  return (
    <div className="relative mb-12 flex justify-center">
      <motion.div
        className="absolute -inset-x-20 -inset-y-12 rounded-[3rem] blur-3xl opacity-70"
        style={{
          backgroundImage: AUTISM_GRADIENT,
          maskImage:
            "radial-gradient(60% 50% at 50% 50%, black 45%, transparent 85%)",
        }}
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <img
        src={LOGO_SRC}
        alt="Braxy Buns Carwash"
        className="relative w-full max-w-2xl drop-shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
      />
    </div>
  );
}
