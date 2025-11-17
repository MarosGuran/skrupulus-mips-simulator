#!/bin/bash
# Script to create or update .htpasswd file for HTTP Basic Authentication
# Usage: ./scripts/create-htpasswd.sh [output-file]

set -e

OUTPUT_FILE="${1:-custom.htpasswd}"

echo "=========================================="
echo "HTTP Basic Authentication Setup"
echo "=========================================="
echo ""
echo "This script will create/update: $OUTPUT_FILE"
echo ""

# Check if htpasswd is installed
if ! command -v htpasswd &> /dev/null; then
    echo "Error: htpasswd command not found!"
    echo ""
    echo "Please install apache2-utils:"
    echo "  Ubuntu/Debian: sudo apt-get install apache2-utils"
    echo "  CentOS/RHEL:   sudo yum install httpd-tools"
    echo "  macOS:         brew install httpd"
    echo "  Alpine:        apk add apache2-utils"
    exit 1
fi

# Check if file exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "File already exists: $OUTPUT_FILE"
    read -p "Do you want to add a new user or overwrite? (a/o/cancel): " choice
    case "$choice" in
        a|A )
            echo "Adding new user to existing file..."
            read -p "Enter username: " username
            htpasswd "$OUTPUT_FILE" "$username"
            ;;
        o|O )
            echo "Overwriting existing file..."
            read -p "Enter username for first user: " username
            htpasswd -c "$OUTPUT_FILE" "$username"
            ;;
        * )
            echo "Cancelled."
            exit 0
            ;;
    esac
else
    echo "Creating new file: $OUTPUT_FILE"
    read -p "Enter username: " username
    htpasswd -c "$OUTPUT_FILE" "$username"
fi

echo ""
echo "=========================================="
echo "Success!"
echo "=========================================="
echo ""
echo "File created: $OUTPUT_FILE"
echo ""
echo "To use this file with Docker:"
echo "1. Edit docker-compose.production.yml"
echo "2. Uncomment the volumes section:"
echo "   volumes:"
echo "     - ./$OUTPUT_FILE:/etc/nginx/.htpasswd:ro"
echo "3. Restart the container:"
echo "   docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "To add more users, run:"
echo "  htpasswd $OUTPUT_FILE another_username"
echo ""
