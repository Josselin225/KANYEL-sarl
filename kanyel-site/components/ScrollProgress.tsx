"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "@/i18n/navigation";

export default function ScrollProgress() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  if (pathname.startsWith("/admin")) return null;

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-gold"
    />
  );
}
