#!/bin/bash

set -e

echo "========================================="
echo "RHEL VM Setup for barBack Testing"
echo "========================================="
echo

if [ ! -f /etc/redhat-release ]; then
    echo "Error: This script must be run on a RHEL system"
    exit 1
fi

echo "Detected OS:"
cat /etc/redhat-release
echo

echo "Configuring SSH..."
sudo systemctl enable sshd
sudo systemctl start sshd

sudo sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart sshd

echo "✓ SSH configured and running"

echo "Creating backup directory..."
sudo mkdir -p /backup
sudo chmod 755 /backup

CURRENT_USER=$(whoami)
sudo chown $CURRENT_USER:$CURRENT_USER /backup

echo "✓ Backup directory created at /backup"

echo "Configuring firewall..."
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

echo "✓ Firewall configured"

echo
echo "Network Information:"
echo "-------------------"
ip -4 addr show | grep inet | grep -v 127.0.0.1
echo

echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo
echo "Your RHEL VM is ready for backup testing."
echo
