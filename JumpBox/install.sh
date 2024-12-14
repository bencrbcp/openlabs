#!/bin/bash

# Exit on any error
set -e

# Ensure the script is running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root."
  exit 1
fi

# Update system and install dependencies
echo "Updating system and installing dependencies..."
apt-get update
apt-get install -y docker.io docker-compose-v2 iptables-persistent

# Automatically save current iptables rules
echo "Saving current iptables rules..."
echo iptables-persistent iptables-persistent/autosave_v4 boolean true | debconf-set-selections
echo iptables-persistent iptables-persistent/autosave_v6 boolean true | debconf-set-selections
dpkg-reconfigure iptables-persistent -f noninteractive

# Create directories for OpenVPN configuration and data
echo "Creating directories for OpenVPN configuration..."
mkdir -p /opt/openvpn/data
mkdir -p /opt/openvpn/config

# Generate docker-compose.yaml file
echo "Setting up Docker Compose for OpenVPN..."
cat <<EOF > /opt/openvpn/docker-compose.yaml
version: '3.8'

services:
  openvpn:
    image: kylemanna/openvpn
    container_name: openvpn
    cap_add:
      - NET_ADMIN
    ports:
      - "1194:1194/udp"
    volumes:
      - ./data:/etc/openvpn
    environment:
      - DEBUG=1
EOF

# Generate initial OpenVPN configuration non-interactively
echo "Initializing OpenVPN server..."
docker run -v /opt/openvpn/data:/etc/openvpn --rm kylemanna/openvpn ovpn_genconfig -u udp://$(hostname -I | awk '{print $1}')

# Set up environment variables to automate EasyRSA prompts
export EASYRSA_BATCH=1
export EASYRSA_REQ_CN="OpenVPN Server CA"

# Generate the CA and server certificates without prompts
docker run -v /opt/openvpn/data:/etc/openvpn --rm -e EASYRSA_BATCH=1 -e EASYRSA_REQ_CN="OpenVPN Server CA" kylemanna/openvpn ovpn_initpki nopass

# Set up IP forwarding and save iptables rules
echo "Enabling IP forwarding and setting up iptables rules..."
sysctl -w net.ipv4.ip_forward=1
sed -i 's/#* *net.ipv4.ip_forward.*$/net.ipv4.ip_forward = 1/' /etc/sysctl.conf

iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE
iptables-save > /etc/iptables/rules.v4

# Start OpenVPN server
echo "Starting OpenVPN server using Docker Compose..."
cd /opt/openvpn
docker compose up -d

echo "OpenVPN server is now running!"
echo "To generate client configuration files, use the following command:"
echo "docker run -v /opt/openvpn/data:/etc/openvpn --rm -it kylemanna/openvpn easyrsa build-client-full <client-name> nopass"
echo "docker run -v /opt/openvpn/data:/etc/openvpn --rm kylemanna/openvpn ovpn_getclient <client-name> > <client-name>.ovpn"
