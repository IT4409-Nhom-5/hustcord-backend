import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags('health')
@Controller("health")
export class HealthController {
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Verify that the application is running and healthy',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application is healthy',
    schema: {
      example: {
        metadata: {
          message: "Application is healthy",
          timestamp: "2026-04-23T10:00:00.000Z",
        },
        data: { status: "ok" },
      },
    },
  })
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
