/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")([
  "@fullcalendar/common",
  "@babel/preset-react",
  "@fullcalendar/common",
  "@fullcalendar/daygrid",
  "@fullcalendar/interaction",
  "@fullcalendar/react",
  "@fullcalendar/timegrid",
]);

const nextConfig = withTM({
  reactStrictMode: true,
});

module.exports = {...nextConfig, ...{
  async rewrites() {
    return [
      {
        source: '/dashboard/:any*',
        destination: '/dashboard',
      },
    ];
  },
}
}