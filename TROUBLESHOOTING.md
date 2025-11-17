# Troubleshooting Guide

## HTTP Basic Authentication Not Working

If you've deployed the application but authentication is not being prompted, try these steps:

### 1. Verify nginx configuration is loaded

Check if the nginx configuration file is present and correct:

```bash
docker exec mips-simulator cat /etc/nginx/conf.d/default.conf
```

You should see the `auth_basic` directives in the output.

### 2. Verify .htpasswd file exists

Check if the password file was created:

```bash
docker exec mips-simulator ls -la /etc/nginx/.htpasswd
docker exec mips-simulator cat /etc/nginx/.htpasswd
```

You should see a file with the hashed password.

### 3. Check nginx error logs

Look for authentication-related errors:

```bash
docker logs mips-simulator 2>&1 | grep -i auth
docker logs mips-simulator 2>&1 | grep -i error
```

### 4. Test nginx configuration

Verify nginx configuration is valid:

```bash
docker exec mips-simulator nginx -t
```

### 5. Reload nginx configuration

If you made changes, reload nginx:

```bash
docker exec mips-simulator nginx -s reload
```

Or restart the container:

```bash
docker-compose restart mips-simulator
```

### 6. Check if accessing the correct domain

Make sure you're accessing the application via the configured domain (`mips.fiit.stuba.sk`) or `localhost`, not by IP address directly. If accessing by IP, nginx might not match the server_name and could be serving from a different configuration.

### 7. Clear browser cache

Sometimes browsers cache authentication settings. Try:
- Opening in incognito/private mode
- Clearing browser cache and cookies
- Using a different browser

### 8. Verify Docker build included the changes

Ensure you rebuilt the Docker image after making changes:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 9. Check nginx main configuration

The default.conf might be overridden by the main nginx.conf. Check:

```bash
docker exec mips-simulator cat /etc/nginx/nginx.conf
```

Look for any `server` blocks or includes that might be conflicting.

## Common Issues

### Issue: Authentication works on /health but not on other paths

**Cause**: The `/health` endpoint has `auth_basic off;` to allow monitoring without authentication.

**Solution**: This is expected behavior. All other paths should require authentication.

### Issue: Getting 403 Forbidden instead of 401 Unauthorized

**Cause**: The .htpasswd file might have incorrect permissions or doesn't exist.

**Solution**: Verify the file exists and is readable:

```bash
docker exec mips-simulator ls -la /etc/nginx/.htpasswd
```

Recreate the container if needed:

```bash
docker-compose down
docker-compose up -d --force-recreate
```

### Issue: Authentication prompt appears but credentials don't work

**Cause**: Password might be incorrect or htpasswd file format is wrong.

**Solution**: Verify the credentials in the Dockerfile match what you're entering:
- Default username: `fiit`
- Default password: `mips` (as of latest commit)

### Issue: No authentication on reverse proxy setup

**Cause**: If using a reverse proxy (like Apache or another nginx), it might be stripping authentication headers.

**Solution**: Configure the reverse proxy to pass through authentication headers or implement authentication at the reverse proxy level instead.

## Manual Fix for Authentication Issues

If authentication still doesn't work, you can manually enable it:

1. Create a custom nginx configuration:

```nginx
server {
    listen 80;
    server_name mips.fiit.stuba.sk localhost;
    root /usr/share/nginx/html;
    index index.html;

    server_tokens off;

    # HTTP Basic Authentication
    auth_basic "MIPS Simulator - FIIT STU BA";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /health {
        auth_basic off;
        access_log off;
        add_header Content-Type text/plain;
        return 200 'OK';
    }
}
```

2. Save as `custom-nginx.conf`

3. Update `docker-compose.yml` to mount it:

```yaml
services:
  mips-simulator:
    volumes:
      - ./custom-nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

4. Restart the container:

```bash
docker-compose restart
```
