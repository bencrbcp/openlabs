#!/bin/bash

# Used to import CPTC8 Windows vmdk files into Proxmox. Copies cmd.exe to Utilman.exe for easy access and debugging 

# Check if exactly three arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <url_to_vmdk.7z_file> <id>"
    echo "Example: $0 https://example.com/example.vmdk.7z 123"
    exit 1
fi

# Assign arguments to variables
vmdk_url="$1"
zip_path="script_tmp.vmdk.7z"
proxmox_id="$2"

wget $vmdk_url -O $zip_path
vmdk_path=$(7zr l $zip_path | awk '/----/{p=1;next}p {print $6}' | grep -v '^$' | head -n 1)
7zr x $zip_path

# Mounting but windows edition
mkdir /mnt/vmdk
guestmount -a $vmdk_path -i --rw /mnt/vmdk
cd /mnt/vmdk/Windows/System32
cp Utilman.exe Utilman.exe.bak
cp cmd.exe Utilman.exe

cd -
umount /mnt/vmdk
rmdir /mnt/vmdk

qm importdisk $proxmox_id $vmdk_path local-lvm
qm rescan

rm $vmdk_path
rm $zip_path
