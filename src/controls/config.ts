interface Config {
  contestName: string
  port: number
  sessionSecret: string
  allowScoreboard: boolean
  registration: {
    allow: boolean;
    recaptcha: {
      enable: boolean;
      siteKey: string;
      secretKey: string;
    };
  }
  contestMode: {
    enabled: boolean;
    startTime: Date;
    endTime: Date;
    hideLogs: boolean;
  }
  rateLimiter?: {
    submit: null | [number, number, number, number];
    register: null | [number, number, number, number];
    logRequest: null | [number, number, number, number];
  }
}

const config: Config = require('../../config')
export default config
