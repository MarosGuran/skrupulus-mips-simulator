# Deployment Guide for MIPS Simulator

This document provides instructions for deploying the MIPS Simulator to the FIIT STU BA server.

## Server Configuration

### DNS Setup
- **Primary domain**: `mips.fiit.stuba.sk`
- **Note**: `vsim.fiit.stuba.sk` is a CNAME that points to a different application

### Network Configuration
- Network Port: `mips` in project `fiit-vs-csi`
- The server should have a public IP address assigned

## System Administrator Tasks

### 1. Create Root Account with Password Authentication

For the network interface transition, a root account with password-only authentication is required:

```bash
# Create a new user with sudo privileges
sudo adduser adminuser
sudo usermod -aG sudo adminuser

# Or enable root password authentication (less recommended)
sudo passwd root

# Enable password authentication in SSH
sudo nano /etc/ssh/sshd_config
```

Edit the SSH configuration:
```
# Find and modify these lines:
PasswordAuthentication yes
PermitRootLogin yes  # or 'prohibit-password' for key-only root login
```

Restart SSH service:
```bash
sudo systemctl restart sshd
```

**Important**: After the network interface transition is complete and verified, it's recommended to:
1. Disable password authentication for root
2. Re-enable key-based authentication only
3. Use sudo users for administration

### 2. Network Interface Transition Process

The network administrator will:
1. Add new network interface with public IP
2. Test SSH access through new interface
3. Remove old interface if successful
4. Fallback to OpenStack console if issues occur

## Application Deployment

### Docker Deployment (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/MarosGuran/skrupulus-mips-simulator.git
cd skrupulus-mips-simulator
```

2. Build and start the container:
```bash
# For development/testing with default credentials:
docker-compose up -d

# For production with custom configuration:
# See docker-compose.production.yml for examples
docker-compose -f docker-compose.production.yml up -d
```

The application will be available on port 8080 by default (or port 80 if using the production configuration).

**Files included:**
- `docker-compose.yml` - Default development configuration
- `docker-compose.production.yml` - Production configuration example with custom volume mounts
- `.htpasswd.example` - Example file showing how to create custom authentication credentials

### HTTP Basic Authentication

The application is protected with HTTP Basic Authentication:
- **Default Username**: `fiit`
- **Default Password**: `mips2024`

#### Changing Authentication Credentials

**Option 1: Using the provided script (Easiest)**

Run the interactive script to create a custom `.htpasswd` file:
```bash
./scripts/create-htpasswd.sh custom.htpasswd
```

The script will guide you through creating the file and provide instructions for use.

**Option 2: Using Docker volume mount (Recommended for production)**

Create a custom `.htpasswd` file manually:
```bash
htpasswd -c custom.htpasswd fiit
# Enter your custom password when prompted
```

Mount it in docker-compose.production.yml:
```yaml
services:
  mips-simulator:
    volumes:
      - ./custom.htpasswd:/etc/nginx/.htpasswd:ro
```

**Option 2: Building custom Docker image**

Edit the Dockerfile before building:
```bash
# Replace the htpasswd command with your credentials
RUN htpasswd -bc /etc/nginx/.htpasswd your_username your_password
```

Then rebuild:
```bash
docker-compose build
docker-compose up -d
```

**Option 3: Multiple users**

Add multiple users to .htpasswd file:
```bash
htpasswd -c htpasswd user1
htpasswd htpasswd user2
htpasswd htpasswd user3
```

### Security Features

#### 1. Server Version Hiding
The nginx configuration includes `server_tokens off;` directive which prevents nginx version disclosure in HTTP headers and error pages.

#### 2. HTTP Basic Authentication
Protects the application from unauthorized public access. Only users with valid credentials can access the application.

#### 3. Health Check Endpoint
The `/health` endpoint is excluded from authentication for monitoring purposes.

### Nginx Virtual Hosts

The nginx configuration is set up to serve the application on:
- `mips.fiit.stuba.sk` (primary domain)
- `localhost` (for local testing)

### Port Configuration

By default, the application runs on port 8080 (mapped to container's port 80). To change this:

Edit `docker-compose.yml`:
```yaml
ports:
  - "80:80"  # For standard HTTP
```

Or use environment-specific port:
```yaml
ports:
  - "${APP_PORT:-8080}:80"
```

## Firewall and Network Security

### GeoIP Restrictions (Optional)

As suggested, GeoIP restrictions should be implemented using iptables on the host system:

```bash
# Example: Allow only Slovak IP addresses
# Install xtables-addons-common and geoip database first
sudo apt-get install xtables-addons-common

# Block all except Slovakia
sudo iptables -A INPUT -p tcp --dport 80 -m geoip ! --src-cc SK -j DROP
sudo iptables -A INPUT -p tcp --dport 443 -m geoip ! --src-cc SK -j DROP
```

**Note**: This is an optional enhancement and should be configured based on actual requirements.

## Monitoring and Maintenance

### Health Check

The application includes a health check endpoint at `/health` that returns "OK" when the service is running.

Test it:
```bash
curl http://localhost:8080/health
# Should return: OK
```

### Docker Logs

View application logs:
```bash
docker-compose logs -f mips-simulator
```

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Integration with STUBA LDAP (Future Enhancement)

For LDAP authentication integration, the nginx configuration would need to be extended with the nginx-auth-ldap module. This is a potential future enhancement that could replace or complement HTTP Basic Authentication.

Example LDAP configuration (for reference):
```nginx
auth_ldap "STUBA LDAP Login";
auth_ldap_servers ldap_server;

ldap_server {
    url ldap://ldap.stuba.sk/dc=stuba,dc=sk?uid?sub?(objectClass=person);
    binddn "cn=readonly,dc=stuba,dc=sk";
    binddn_passwd "password";
    group_attribute member;
    group_attribute_is_dn on;
    require valid_user;
}
```

## Troubleshooting

For detailed troubleshooting steps, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

### Quick checks

#### Cannot access the application
- Check if container is running: `docker ps`
- Check logs: `docker-compose logs`
- Verify port is not in use: `netstat -tulpn | grep 8080`

#### Authentication not working
- Verify .htpasswd file exists: `docker exec mips-simulator ls -la /etc/nginx/.htpasswd`
- Check nginx configuration: `docker exec mips-simulator nginx -t`
- Verify credentials: `docker exec mips-simulator cat /etc/nginx/.htpasswd`
- Rebuild container: `docker-compose down && docker-compose up -d --force-recreate --build`

#### Health check failing
- Check if nginx is running: `docker exec mips-simulator ps aux | grep nginx`
- Test health endpoint: `docker exec mips-simulator wget -O- http://localhost/health`

## Contact

For issues or questions, contact:
- Project maintainer: MarosGuran <m.guran123@gmail.com>
- Network administrator: M. Pavelka
