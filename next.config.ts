import type { NextConfig } from "next";

import { loadLibEnv } from "./lib/load-lib-env";

loadLibEnv();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
