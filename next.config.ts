import withBundleAnalyzer from "@next/bundle-analyzer"
import { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
    scrollRestoration: true,
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(config);
