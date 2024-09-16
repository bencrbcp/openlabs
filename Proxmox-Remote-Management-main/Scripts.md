# Proxmox and pfSense Remote Management Scripts

Scripts for managing users in bulk, creating templates from virtual machines, cloning environments for a set of users, reverting virtual machines, and destroying cloned environments. This serves as the backend for the web interface, which may be found [here](Web.md).

### Setup
**Note:** Requires Python 3.9. These instructions are for installing ONLY the Python scripts. To install these scripts along with the web interface, consult the setup instructions [here](Web.md).

pip installation to be created in the near future
1. Create a new API key on Proxmox to be used by these scripts for remote access
1. (Optional) Create a pfSense virtual machine on Proxmox and enable SSH
1. Select a folder to save the scripts in. My recommendation for Linux is `/opt`: `cd /opt`
1. Clone this repository: `git clone https://github.com/RedefiningReality/Proxmox-Remote-Management.git`
1. Enter the cloned directory: `cd Proxmox-Remote-Management`
1. Run the [setup script](setup.py): `sudo setup.py --no-web-dependencies` or `sudo python setup.py --no-web-dependencies`. It will walk you through the process, test your current Proxmox and pfSense installation, and modify the scripts accordingly.
1. (Optional) If you plan to use the command line scripts directly as well, modify [easyclone.sh](scripts/easyclone.sh) and [easypurge.sh](scripts/easypurge.sh) to your liking. See comments in each script.
You can add these to your PATH so that they may be executed as commands with the following:
```
ln -s easyclone.sh /usr/bin/easyclone
ln -s easypurge.sh /usr/bin/easypurge
```

Additional notes on the setup script:
- You may pass any options as arguments instead of answering the prompts. Prompts associated with options you pass in this way will not be displayed.
- If you don't want to validate connection to Proxmox and/or pfSense (not recommended), you may use `-b` to bypass all checks.
- If you'd like to perform a fully unattended installation (no prompts), be sure to:
  - use `--firewall/--no-firewall` to specify whether you're using a pfSense firewall
  - use `--script-dependencies/--no-script-dependencies` to specify whether you'd like to automatically install Python dependencies
  - use `--add-to-path/--no-add-to-path` to specify whether you'd like to add links to the finished scripts to your PATH (recommended)
  - specify all other options! Any options you don't specify you'll be prompted to provide.

### Commands
- [template](scripts/template.py) ⇒ convert Proxmox virtual machines into clonable templates
- [clone](scripts/clone.py) ⇒ clone Proxmox virtual machine templates, adding corresponding Linux bridge and Proxmox user for access
- [revert](scripts/revert.py) ⇒ revert (rollback) Proxmox virtual machines to their first available snapshot or a given snapshot (by name)
  - can revert based on virtual machine ID or name
- [purge](scripts/purge.py) ⇒ remove Proxmox virtual machines and corresponding Linux bridge, performing cleanup
- [puser](scripts/puser.py) ⇒ create, destroy, and change passwords for Proxmox users
  - for more information, consult the [puser guide](Proxmox%20User%20(PUser)%20Script%20Guide.md)
- [colors.py](scripts/colors.py) ⇒ dependency that allows other scripts to print coloured output on Unix-based Operating Systems
- [easyclone](scripts/easyclone.sh) ⇒ template bash script that runs [clone](scripts/clone.py) with a set of predefined arguments
- [easypurge](scripts/easypurge.sh) ⇒ template bash script that runs [purge](scripts/purge.py) with a set of predefined arguments

### Command examples
`template 500-505 -r`

`clone 500-505 -c doge -i 600 -u -n "Your Mom" -e memes4dayz@totallyvaliddomain.com -p Password123 -b -bs 10.0.21.0/24 -bv 400,402,500-503 -ss initial -f -fi 10.0.21.254 -db 10.0.21.10 -de 10.0.21.245 -dd 1.1.1.1 8.8.8.8 -ds 500,10.0.21.3 -s`

`revert -c doge -ss initial -s`

`purge doge -u -b -bv 400,402 -f`

### Usage information
The help screens for each command are sufficiently detailed to warrant not writing other documentation. Run any command with `-h`: eg. `clone -h`. However, `puser` has [its own page](Proxmox%20User%20(PUser)%20Script%20Guide.md) that's worth checking out.
