# -*- coding: utf-8 -*-
"""Deploy site trung-thu lên server qua SSH/SFTP.
Cách dùng: python deploy.py <IP> <user> <mật khẩu>
"""
import sys, os, posixpath
import paramiko

HOST = sys.argv[1] if len(sys.argv) > 1 else '192.168.1.103'
USER = sys.argv[2] if len(sys.argv) > 2 else 'root'
PASS = sys.argv[3] if len(sys.argv) > 3 else ''

ROOT = 'index.html'
DIRS = ['css', 'js', 'fonts', 'img', 'audio']
DEFAULT_INDEXES = ('index.html', 'index.htm', 'index.nginx-debian.html')


def connect():
    cli = paramiko.SSHClient()
    cli.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        cli.connect(HOST, username=USER, password=PASS, timeout=10,
                    look_for_keys=False, allow_agent=False)
        return cli
    except paramiko.AuthenticationException:
        pass
    # một số sshd chỉ nhận keyboard-interactive
    t = paramiko.Transport((HOST, 22))
    t.connect()
    def handler(title, instr, prompts):
        return [PASS] * len(prompts)
    t.auth_interactive_dumb(USER, handler)
    cli._transport = t
    return cli


def main():
    cli = connect()
    sftp = cli.open_sftp()
    print('✓ SSH OK:', HOST, 'user', USER)

    def sh(cmd):
        _, o, e = cli.exec_command(cmd, timeout=30)
        return o.read().decode().strip(), e.read().decode().strip()

    # 1) dò docroot
    nginx_root, _ = sh("nginx -T 2>/dev/null | grep -oE 'root\\s+[^;]+' | head -1 | awk '{print $2}'")
    apache_root, _ = sh("grep -rhoE 'DocumentRoot\\s+\\S+' /etc/apache2 /etc/httpd 2>/dev/null | head -1 | awk '{print $2}'")
    docroot = nginx_root or apache_root
    if not docroot:
        for cand in ('/var/www/html', '/usr/share/nginx/html', '/srv/www'):
            o, _ = sh(f'[ -d {cand} ] && echo yes')
            if o:
                docroot = cand
                break
    if not docroot:
        docroot = '/var/www/html'
        sh(f'mkdir -p {docroot}')
    print('Docroot:', docroot)

    listing, _ = sh(f'ls -A {docroot} 2>/dev/null')
    entries = [x for x in listing.split() if x]
    only_default = all(e in DEFAULT_INDEXES for e in entries)
    target = docroot if (not entries or only_default) else posixpath.join(docroot, 'trung-thu')
    if target != docroot:
        sh(f'mkdir -p {target}')
    print('Thư mục đích:', target)

    # 2) upload
    files = [ROOT]
    for d in DIRS:
        for f in os.listdir(d):
            if f.endswith(('.woff2', '.css', '.webp', '.mp3')):
                files.append(f'{d}/{f}')

    def ensure_dir(path):
        cur = ''
        for p in path.split('/'):
            cur = posixpath.join(cur, p)
            try:
                sftp.stat(cur)
            except IOError:
                sftp.mkdir(cur)

    total = 0
    for f in files:
        local = os.path.join('.', f.replace('/', os.sep))
        remote = posixpath.join(target, f)
        ensure_dir(posixpath.dirname(remote))
        sftp.put(local, remote)
        total += os.path.getsize(local)
        print(f'  ↑ {f} ({os.path.getsize(local)//1024}KB)')
    print(f'✓ Đã upload {len(files)} file, tổng {total//1024}KB')

    # 3) quyền đọc
    sh(f'find {target} -type d -exec chmod 755 {{}} + && find {target} -type f -exec chmod 644 {{}} +')

    # 4) xác minh ngay trên server
    path = '' if target == docroot else '/trung-thu'
    o, _ = sh(f'curl -s -o /dev/null -w "%{{http_code}}" http://127.0.0.1{path}/index.html')
    print('HTTP kiểm tra nội bộ:', o)

    url = f'http://{HOST}/' if target == docroot else f'http://{HOST}/trung-thu/'
    print('🎉 Xong! Mở:', url)
    sftp.close()
    cli.close()


if __name__ == '__main__':
    main()
