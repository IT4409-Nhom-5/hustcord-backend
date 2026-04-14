import { Controller, Get } from "@nestjs/common";
@Controller("health")
export class HealthController {
  @Get()
  check() {
    try {
      return {
        metadata: {
          message: "Application is healthy",
          timestamp: new Date().toISOString(),
        },
        data: { status: "ok" },
      };
    } catch (err) {
      return {
        metadata: {
          error: err,
          timestamp: new Date().toISOString(),
        },
        data: null,
      };
    }
  }
}
