import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "storage.googleapis.com" },
		],
	},
};

export default nextConfig;
