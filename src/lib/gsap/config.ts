"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { TextPlugin } from "gsap/TextPlugin";

// Register all plugins ONCE
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, TextPlugin);
}

export { gsap, useGSAP, ScrollTrigger, CustomEase, TextPlugin };
