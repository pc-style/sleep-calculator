module.exports = {
  apps: [
    {
      name: "sleep-calculator",
      script: "npm",
      args: "start -- -p 5200",
      cwd: "/root/sleep-calculator",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5200
      }
    }
  ]
};
