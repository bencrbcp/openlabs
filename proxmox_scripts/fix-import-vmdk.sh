#!/bin/bash

# Used to import the CPTC8 Linux vmdks into proxmox. Removed the root user password for easy access and debugging 

# Check if exactly three arguments are provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <url_to_vmdk.7z_file> <mac_address> <id>"
    echo "Example: $0 https://example.com/example.vmdk.7z AA:BB:CC:DD:EE:FF 123"
    exit 1
fi

# Assign arguments to variables
vmdk_url="$1"
zip_path="script_tmp.vmdk.7z"
mac_address="$2"
proxmox_id="$3"

wget $vmdk_url -O $zip_path
vmdk_path=$(7zr l $zip_path | awk '/----/{p=1;next}p {print $6}' | grep -v '^$' | head -n 1)
7zr x $zip_path

# Mounting the vmdk and editing stuff
modprobe nbd
qemu-nbd --connect=/dev/nbd0 $vmdk_path
mkdir /mnt/vmdk
mount /dev/nbd0p1 /mnt/vmdk

cd /mnt/vmdk
sed -i 's/^root:[^:]*:/root::/' ./etc/passwd
cat <<EOF > ./etc/systemd/network/eth0.network
[Match]
MACAddress=$mac_address

[Network]
DHCP=yes
EOF

cd -
umount /mnt/vmdk
qemu-nbd --disconnect /dev/nbd0
rmdir /mnt/vmdk

qm importdisk $proxmox_id $vmdk_path local-lvm
qm rescan

rm $vmdk_path
rm $zip_path
