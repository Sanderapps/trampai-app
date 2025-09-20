module.exports = {
  apps: [
    {
      name: 'trampai',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/trampai-app',
      exec_mode: 'fork',
      instances: 1,
    },
  ],
};
