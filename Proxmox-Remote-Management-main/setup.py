#!/usr/bin/env python3

import argparse
import platform
import socket
import os, sys, shutil, subprocess

import warnings
warnings.filterwarnings("ignore", message="Unverified HTTPS request")

sys.path.append('scripts')
from colors import printc, Color

python_dependencies = ['proxmoxer', 'requests', 'paramiko', 'scp']

scripts_dir = 'scripts/'
scripts = ['template.py', 'revert.py', 'clone.py', 'purge.py', 'puser.py']

web_dir = 'web/'
web = ['index.php', 'login.php', 'logout.php', 'password.php', 'register.php', 'scripts.php', 'test.php', 'creds.php']
config = 'config.ini'

def is_int(num):
    try:
        int(num)
        return True
    except ValueError:
        printc(f'{num} is not a valid integer!', Color.YELLOW)
        return False

def test(host, port):
    print(f'Testing connection to {host} on port {port}')
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex((host,port))

    if result == 0:
        printc(f'Connection to {host} successful!\n', Color.GREEN)
    else:
        printc(f'Failed to connect to {host} on port {port}!\n', Color.RED)
        exit()

def replace(file, params):
    print(f'Writing changes to file {file}')
    data = open(file, 'r').read()
    for original, new in params.items():
        '''
        print(f'{original}: ')
        print(new)
        print(type(new))
        '''
        data = data.replace(original, new)
    open(file, 'w').write(data)
    print(f'Wrote all changes to file {file}')

def move(source, destination):
    print(f'Moving file {source} to directory {destination}')

    if not os.path.isfile(source):
        printc(f'File {source} not found!', Color.RED)
        exit()

    if not os.path.exists(destination):
        os.makedirs(destination)
    
    new = os.path.join(destination, os.path.basename(source))
    try:
        result = shutil.move(source, new)
        print(f'Moved file {source} to directory {destination}')
        return result
    except Exception as e:
        printc(f'Failed to move file {source} to directory {destination}', Color.RED)
        print(f'Exception: {e}')
        exit()

def run_command(command):
    print(f'Running command: {command}')
    try:
        subprocess.run(command.split(' '), check=True)
    except subprocess.CalledProcessError as e:
        printc(f'Command failed!', Color.RED)
        print(f'Return code: {e.returncode}')
        print(f'Error output: {e.output}')
        exit()

# Parse command line arguments
parser = argparse.ArgumentParser('setup Proxmox remote management scripts')

parser.add_argument('-b', '--bypass-checks', action='store_true', help='bypass all checks to ensure correct values were entered (useful if you haven\'t finished setting up Proxmox)')
parser.add_argument('-s', '--script-dependencies', action=argparse.BooleanOptionalAction, help='True/False - install script dependencies using the pip package manager')
parser.add_argument('-w', '--web-dependencies', action=argparse.BooleanOptionalAction, help='True/False - install web dependencies using the apt,apt-get, or yum package manager')
parser.add_argument('-p', '--add-to-path', action=argparse.BooleanOptionalAction, help='True/False - whether or not to add scripts to PATH')

parser.add_argument('-pH', '--proxmox-host', type=str, help='Proxmox hostname and/or port number (ex: cyber.ece.iit.edu or 216.47.144.122:443)')
parser.add_argument('-pu', '--proxmox-user', type=str, help='Proxmox username for authentication')
parser.add_argument('-ptn', '--proxmox-token-name', type=str, help='name of Proxmox authentication token for user')
parser.add_argument('-ptv', '--proxmox-token-value', type=str, help='value of Proxmox authentication token')
parser.add_argument('-pn', '--proxmox-node', type=str, help='node containing virtual machines to template')

parser.add_argument('-f', '--configure-firewall', action=argparse.BooleanOptionalAction, help='True/False - whether or not to configure pfSense firewall (useful for scripted/unattended installation)')
parser.add_argument('-fH', '--firewall-host', type=str, help='hostname of pfSense firewall to configure DHCP on through SSH')
parser.add_argument('-fP', '--firewall-port', type=int, help='SSH port for the pfSense firewall (default is 22)')
parser.add_argument('-fu', '--firewall-user', type=str, help='username for the pfSense firewall')
parser.add_argument('-fp', '--firewall-password', type=str, help='password for the pfSense firewall')
parser.add_argument('-ft', '--firewall-timeout', type=float, default=5, help='time in seconds before connection to pfSense times out (default is 5)')
parser.add_argument('-fc', '--firewall-config', type=str, help='path to configuration file in pfSense - this should be /cf/conf/config.xml (default) unless using a customised pfSense instance')

args = parser.parse_args()

if platform.system() == 'Linux' and os.getuid() != 0:
    print(f'Please run this script as root: sudo {sys.argv[0]}')
    exit()

if args.script_dependencies is None:
    print(f'The following Python script dependencies are required: '+', '.join(python_dependencies))
    args.script_dependencies = input('Install script dependencies using pip package manager? [Y/n]').lower() != 'n'

if args.script_dependencies:
    print('Installing script dependencies with pip package manager')
    command = f'{sys.executable} -m pip install --break-system-packages '
    command += ' '.join(python_dependencies)
    run_command(command)
    printc('Script dependencies installed!\n', Color.GREEN)

if args.proxmox_host is None:
    host = input('Enter hostname of Proxmox instance (eg. cyber.ece.iit.edu or 216.47.144.122): ')
    port = input('Enter port number of Proxmox instance (default 8006): ')

    if port == '':
        args.proxmox_host = host
    else:
        while not is_int(port):
            port = input('Enter port number of Proxmox instance: ')
        args.proxmox_host = host+':'+port

# Test connection
if not args.bypass_checks:
    if ':' in args.proxmox_host:
        host, port = args.proxmox_host.split(':')
        port = int(port)
    else:
        host = args.proxmox_host
        port = 8006

    test(host, port)

if args.proxmox_user is None:
    args.proxmox_user = input('Enter Proxmox username for authentication (eg. root@pam): ')
    while '@' not in args.proxmox_user:
        print('No realm (@pam, @pve, etc) specificed!')
        args.proxmox_user = input('Enter Proxmox username for authentication (eg. root@pam): ')

if args.proxmox_token_name is None:
    args.proxmox_token_name = input(f'Enter name of Proxmox authentication token for user {args.proxmox_user} (default {args.proxmox_user[:-4]}): ')
    if args.proxmox_token_name == '':
        args.proxmox_token_name = args.proxmox_user[:-4]

if args.proxmox_token_value is None:
    args.proxmox_token_value = input(f'Enter the value of the Proxmox authentication token for {args.proxmox_token_name}: ')

# Test authentication
if not args.bypass_checks:
    from proxmoxer import ProxmoxAPI, ResourceException
    
    print(f'Testing authentication as user {args.proxmox_user} with token {args.proxmox_token_name}:{args.proxmox_token_value}')
    pm = ProxmoxAPI(args.proxmox_host, user=args.proxmox_user, token_name=args.proxmox_token_name, token_value=args.proxmox_token_value, verify_ssl=False)

    try:
        nodes = pm.nodes.get()
        printc('Authentication successful!\n', Color.GREEN)
    except ResourceException:
        printc('Unable to authenticate to Proxmox!', Color.RED)
        exit()
    except Exception:
        printc(f'{args.proxmox_host} does not appear to be a valid Proxmox instance!', Color.RED)
        exit()

    node_names = [node['node'] for node in nodes]
    print('Available nodes: '+', '.join(node_names))

if args.proxmox_node is None:
    args.proxmox_node = input('Enter Proxmox node: ')

    if not args.bypass_checks:
        while args.proxmox_node not in node_names:
            print(f'{args.proxmox_node} is not a valid node')
            print('Available nodes: '+', '.join(node_names))
            args.proxmox_node = input('Enter Proxmox node: ')

# check node against node_names

if args.configure_firewall is None:
    args.configure_firewall = input('\nWould you like to configure a pfSense firewall? [Y/n]: ').lower() != 'n'

if args.configure_firewall:
    
    if args.firewall_host is None:
        args.firewall_host = input('Enter hostname of the pfSense firewall (eg. 216.47.158.239): ')

    if args.firewall_port is None:
        args.firewall_port = input('Enter port number of the pfSense firewall (default 22): ')

    if args.firewall_port == '':
        args.firewall_port = '22'
    else:
        while not is_int(port):
            args.firewall_port = input('Enter port number of the pfSense firewall: ')

    # Test connection
    if not args.bypass_checks:
        test(args.firewall_host, int(args.firewall_port))

    if args.firewall_user is None:
        args.firewall_user = input('Enter name of pfSense firewall SSH user (default root): ')
    if args.firewall_user == '':
        args.firewall_user = 'root'

    if args.firewall_password is None:
        args.firewall_password = input('Enter password for firewall SSH user: ')

    # Test authentication
    if not args.bypass_checks:
        print(f'Testing authentication as user {args.firewall_user} with password {args.firewall_password}')
        import paramiko
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
        try:
            ssh.connect(args.firewall_host, args.firewall_port, args.firewall_user, args.firewall_password, timeout=args.firewall_timeout)
            printc('Authentication successful!\n', Color.GREEN)
        except paramiko.AuthenticationException:
            printc('Unable to authenticate to pfSense!', Color.RED)
            exit()
        except (paramiko.SSHException, Exception):
            printc(f'{args.firewall_host} does not appear to be running SSH on port {args.firewall_port}!', Color.RED)
            exit()

    if args.firewall_config is None:
        args.firewall_config = input('Enter path to configuration file in pfSense (default /cf/conf/config.xml): ')
    if args.firewall_config == '':
        args.firewall_config = '/cf/conf/config.xml'

    # Test access to config file
    if not args.bypass_checks:
        print(f'Checking access to configuration file {args.firewall_config}')
        _, stdout, _ = ssh.exec_command(f'head {args.firewall_config}')
        result = stdout.read()
            
        if result == b'':
            printc('Unable to read configuration file!', Color.RED)
            exit()
        else:
            printc('Successfully read configuration file!\n', Color.GREEN)

        ssh.exec_command('exit')
        ssh.close()

if not args.configure_firewall:
    args.firewall_host = 'none'
    args.firewall_port = 0
    args.firewall_user = 'root'
    args.firewall_password = 'password'
    args.firewall_config = '/cf/conf/config.xml'
    print()

params = {
    'PROXMOXHOST': args.proxmox_host,
    'PROXMOXUSER': args.proxmox_user,
    'PROXMOXTNAME': args.proxmox_token_name,
    'PROXMOXTVAL': args.proxmox_token_value,
    'PROXMOXNODE': args.proxmox_node,

    'FIREWALLHOST': args.firewall_host,
    'FIREWALLPORT': str(args.firewall_port),
    'FIREWALLUSER': args.firewall_user,
    'FIREWALLPASS': args.firewall_password,
    'FIREWALLTIMEOUT': str(args.firewall_timeout),
    'FIREWALLCONFIG': args.firewall_config
}

print('Updating script files to reflect provided information')
for script in scripts:
    replace(scripts_dir+script, params)
replace(web_dir+config, params)
printc('All script files updated accordingly!\n', Color.GREEN)

if platform.system() == 'Linux':
    print('Adding read and execute permissions for all users to all files')
    for script in scripts:
        os.chmod(scripts_dir+script, 0o755)
    for file in web:
        os.chmod(web_dir+file, 0o755)

    if args.add_to_path is None:
        args.add_to_path = input('Add script links to PATH? (recommended) [Y/n]: ').lower() != 'n'

    if args.add_to_path:
        acceptable = os.getenv('PATH')
        if acceptable is None or acceptable == '':
            printc('PATH environment variable not found!', Color.RED)
            exit()

        base = ''
        paths = ['/usr/bin', '/usr/sbin', '/usr/local/bin', '/usr/local/sbin']
        for path in paths:
            if path in acceptable:
                base = path
                break
        else:
            base = acceptable.split(':')[0]
    
        print('Adding scripts to PATH so you can run them as commands')
        current = os.getcwd()
        for script in scripts:
            file = f'{current}/{scripts_dir+script}'
            link = f'{base}/{script[:-3]}'
            run_command(f'ln -s {file} {link}')
            print(f'{script} -> {link}')

        printc('Links added to PATH for all scripts!\n', Color.GREEN)

    if args.web_dependencies is None:
        print('Requirements for the automatic web setup to work:')
        print(' - apt, apt-get, or yum package manager')
        print(' - systemd service manager')
        print('These requirements will be met on default installations of most popular Linux distros (Debian, Ubuntu, Fedora, RHEL, CentOS, etc.)')
        args.web_dependencies = input('Install apache2 and php packages? (required for web setup) [Y/n]: ').lower() != 'n'

    if args.web_dependencies:
        command = ''
        service = 'apache2'

        if shutil.which('apt') is not None:
            command = 'apt install -y apache2 php libapache2-mod-php php-curl'
        elif shutil.which('apt-get') is not None:
            command = 'apt-get install -y apache2 php libapache2-mod-php php-curl'
        elif shutil.which('yum') is not None:
            command = 'yum install -y httpd php php-curl'
            service = 'httpd'

        if command == '':
            printc('No suitable package manager found! Please install apache2, php, and php-curl manually', Color.YELLOW)
            printc('Then you may use configure.py to complete your installation', Color.YELLOW)
            exit

        manager = command.split(' ')[0]
        print(f'Located {manager} package manager')
        run_command(f'{manager} update')

        print('Installing packages')
        run_command(command)
        printc('Installed apache2 and php successfully!\n', Color.GREEN)
        
        printc('You may now run configure.py to configure the apache2 web server accordingly', Color.YELLOW)
    else:
        printc('If you only wish to use the Python scripts, your installation is now complete', Color.YELLOW)
        printc('If you wish to use the web interface as well, please install apache2, php, and php-curl', Color.YELLOW)
        printc('Then you may use configure.py to complete your installation', Color.YELLOW)
