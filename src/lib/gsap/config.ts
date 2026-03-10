"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { TextPlugin } from "gsap/TextPlugin";
// Note: DrawSVGPlugin and SplitText require GSAP Club license
// Uncomment when license is available:
// import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
// import { SplitText } from "gsap/SplitText";

// Register all plugins ONCE
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, TextPlugin);
  // Add when licensed: DrawSVGPlugin, SplitText
}

export { gsap, useGSAP, ScrollTrigger, CustomEase, TextPlugin };
// Export when licensed: DrawSVGPlugin, SplitText
