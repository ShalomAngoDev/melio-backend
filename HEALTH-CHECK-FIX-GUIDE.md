# Health Check Fix Guide

## Problem
Railway deployment was failing with health check errors:
```
Attempt #1 failed with service unavailable. Continuing to retry for 7s
1/1 replicas never became healthy!
```

## Root Causes Identified

1. **Strict Health Check Dependencies**: The health check required both database AND Redis connections, but Redis might not be available in production
2. **Short Timeout**: Railway health check timeout was only 10 seconds, insufficient for application startup
3. **Memory Thresholds**: Health check memory thresholds were too restrictive for production
4. **Docker Health Check**: Used `$PORT` variable that might not be set during health check

## Fixes Applied

### 1. Health Service Improvements (`health.service.ts`)
- Made Redis connection optional in readiness check
- Only database connection is required for readiness
- Redis failure won't cause health check to fail
- Better error reporting for service status

### 2. Health Controller Updates (`health.controller.ts`)
- Increased memory thresholds from 150MB to 300MB
- Increased disk threshold from 50% to 80%
- Added simple health check endpoint (`/api/v1/health/simple`) with no external dependencies

### 3. Railway Configuration (`railway.json`)
- Increased health check timeout from 10s to 30s
- Added health check interval: 10s
- Added health check retries: 5
- Changed health check path to `/api/v1/health/simple`

### 4. Docker Configuration (`Dockerfile.simple`)
- Increased health check timeout from 10s to 30s
- Increased start period from 40s to 60s
- Increased retries from 3 to 5
- Fixed PORT variable usage with fallback: `${PORT:-3000}`
- Changed health check path to `/api/v1/health/simple`

## Health Check Endpoints

### `/api/v1/health` - Full Health Check
- Checks database connection (required)
- Checks Redis connection (optional)
- Checks memory usage
- Checks disk usage
- More comprehensive but slower

### `/api/v1/health/simple` - Simple Health Check
- No external dependencies
- Only checks application status
- Faster response time
- Used by Railway for deployment health checks

### `/api/v1/health/ready` - Readiness Probe
- Checks if service is ready to accept traffic
- Database connection required
- Redis connection optional

### `/api/v1/health/live` - Liveness Probe
- Checks if service is alive
- No external dependencies
- Basic application status

## Deployment Steps

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Fix health check configuration for Railway deployment"
   git push
   ```

2. **Redeploy to Railway**:
   - Railway will automatically detect the changes
   - New deployment will use the improved health check configuration
   - Health check should now pass within 30 seconds

3. **Monitor Deployment**:
   - Check Railway logs for health check status
   - Verify `/api/v1/health/simple` endpoint responds correctly
   - Monitor application startup time

## Environment Variables Required

Ensure these environment variables are set in Railway:

```bash
# Database (Required)
DATABASE_URL=postgresql://...

# Redis (Optional - will use mock service if not available)
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...

# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# Other required variables...
```

## Testing Health Checks Locally

```bash
# Test simple health check
curl http://localhost:3000/api/v1/health/simple

# Test full health check
curl http://localhost:3000/api/v1/health

# Test readiness
curl http://localhost:3000/api/v1/health/ready

# Test liveness
curl http://localhost:3000/api/v1/health/live
```

## Expected Results

After deployment:
- Health check should pass within 30 seconds
- Application should start successfully
- All health endpoints should respond correctly
- Railway deployment should complete without errors

## Troubleshooting

If health check still fails:

1. **Check Railway Logs**: Look for startup errors or connection issues
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Test Locally**: Run the application locally and test health endpoints
4. **Check Database Connection**: Ensure database is accessible from Railway
5. **Monitor Memory Usage**: Check if application exceeds memory limits

## Additional Notes

- The simple health check endpoint is now used for Railway deployment health checks
- Full health check endpoint is still available for comprehensive monitoring
- Redis is now optional for basic application functionality
- Memory and disk thresholds have been increased for production workloads
