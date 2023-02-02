// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const withReactSvg = require("next-react-svg");
const withPlugins = require("next-compose-plugins");
const path = require("path");

module.exports = withSentryConfig(
  withPlugins(
    [
      [
        withReactSvg,
        {
          include: path.resolve(__dirname, "src/assets/svg"),
          webpack(config, options) {
            config.resolve.fallback = {
              ...config.resolve.fallback,
              fs: false,
            };
            return config;
          },
        },
      ],
    ],
    {
      reactStrictMode: true,
      webpack5: true,
      webpack: (config) => {
        config.resolve.fallback = { fs: false };

        return config;
      },
      typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
      },
      eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
      },
    }
  ),
  { silent: true, hideSourcemaps: true },
);
