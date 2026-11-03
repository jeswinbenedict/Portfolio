# Ansible — Configuration Management

---

## 1. What it is

Ansible configures machines. You declare the state you want — Docker
installed, container running — and it makes the machine match.

Two properties that define it:

**Agentless.** Nothing is installed on the managed machine. Ansible connects
over plain SSH and needs only Python on the far end. Compare Puppet or Chef,
which require an agent daemon on every host.

**Idempotent.** Running the playbook five times leaves the system in the same
state as running it once.

---

## 2. Idempotency — the thing to demonstrate

A shell script doing this:

```bash
docker run -d --name portfolio -p 3000:3000 image
```

works the first time and **errors** the second (`name already in use`). It is
not safe to re-run, so it is not safe to use for recovery.

The Ansible equivalent inspects the host, sees the container already matches
the declared state, and reports `ok` instead of `changed`.

### Measured on this machine

```
First run:   ok=11   changed=1   failed=0   skipped=7
Second run:  ok=11   changed=0   failed=0   skipped=7
                     ^^^^^^^^^
```

**`changed=0` on the second run is the whole point.** Nothing was touched
because nothing needed touching.

The `skipped=7` is idempotency too — the Docker-install tasks carry
`when: docker_check.rc != 0`, and Docker was already present.

> In the exam, run it twice and point at that number.

---

## 3. The vocabulary

| Term | Meaning |
|---|---|
| **Inventory** | The list of hosts and how to reach them |
| **Play** | Maps a group of hosts to a list of tasks |
| **Task** | One unit of work, calling a module |
| **Module** | The thing that does the work (`apt`, `systemd`, `docker_container`) |
| **Role** | A reusable bundle of tasks |
| **Handler** | A task that runs only when notified by a change |
| **Facts** | Information gathered about the target (OS, IP, memory) |

---

## 4. Inventory

```ini
[local]
localhost ansible_connection=local

[webservers]
portfolio ansible_host=56.228.18.13 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/portfolio
```

`ansible_connection=local` runs commands directly instead of opening SSH —
which is exactly what lets the whole playbook be exercised **offline, with no
server and no internet**.

Target a group with `--limit`:

```bash
ansible-playbook playbook.yml --limit local
ansible-playbook playbook.yml --limit webservers
```

---

## 5. Modules are declarative

```yaml
- name: Ensure the Docker service is running and enabled
  ansible.builtin.systemd:
    name: docker
    state: started
    enabled: true
```

You are not saying "run `systemctl start docker`". You are saying "it should
be started" — Ansible checks, and acts only if needed. That check is where
idempotency comes from.

Compare a raw `command`, which Ansible cannot reason about:

```yaml
- name: Check whether Docker is already installed
  ansible.builtin.command: docker --version
  register: docker_check
  changed_when: false     # this only READS state
  failed_when: false      # a missing binary is a branch, not a failure
```

`changed_when: false` is you telling Ansible "this never changes anything" —
without it, every run would report a change and idempotency would be a lie.

---

## 6. Conditionals and registering results

```yaml
- name: Run the Docker installer
  ansible.builtin.command: sh /tmp/get-docker.sh
  when: docker_check.rc != 0
  changed_when: true
```

`register` captures a task's result; `when` consumes it. This pairing is how
you branch on the state of the machine.

---

## 7. Roles

A role is a directory of tasks you can apply anywhere:

```
roles/docker_app/
└── tasks/main.yml
```

```yaml
roles:
  - docker_app
```

The same logic now applies to another host or project by listing the role,
rather than copy-pasting tasks.

---

## 8. Always verify the deploy

```yaml
- name: Wait for the application to answer on its port
  ansible.builtin.uri:
    url: "http://localhost:{{ app_port }}"
    status_code: 200
  register: health
  retries: 15
  delay: 2
  until: health.status is defined and health.status == 200

- name: Assert the v2 build is the one serving
  ansible.builtin.assert:
    that:
      - "'Dockerized' in page.content"
    success_msg: "v2 confirmed — the version badge is present."
    fail_msg: "The app responded, but the v2 badge is missing. Wrong image tag?"
```

`retries`/`until` handles the few seconds Next.js needs to start listening.
The `assert` turns "it returned 200" into "it returned **the right thing**" —
a deploy that silently shipped v1 would fail here instead of passing.

---

## 9. Running it

```bash
wsl -d Ubuntu
cd /mnt/c/Users/jeswi/OneDrive/Desktop/portfolio/devops/ansible
export ANSIBLE_CONFIG=$PWD/ansible.cfg

ansible-playbook playbook.yml --limit local --check     # dry run
ansible-playbook playbook.yml --limit local             # real
ansible-playbook playbook.yml --limit local             # again: changed=0
```

Useful flags:

| Flag | Effect |
|---|---|
| `--check` | Dry run — report changes, make none |
| `--diff` | Show file content changes |
| `-v` / `-vvv` | More output; `-vvv` shows SSH detail |
| `--limit <group>` | Restrict to some hosts |
| `--start-at-task "name"` | Resume mid-playbook |

---

## 10. ⚠ The `/mnt/c` gotcha

Running from a Windows drive inside WSL produces:

```
[WARNING]: Ansible is being run in a world writable directory
(/mnt/c/...), ignoring it as an ansible.cfg source
```

Windows drives are world-writable to Linux, and Ansible refuses to load a
config file from a world-writable directory — otherwise anyone able to write
to that folder could redirect your playbook to their own hosts. It is a
security feature, not a bug.

**Fix** — name the file explicitly, which overrides the check:

```bash
export ANSIBLE_CONFIG=$PWD/ansible.cfg
```

Without this, `inventory.ini` is never read and `--limit local` matches
nothing.

---

## 11. Other things that bite

| Symptom | Cause |
|---|---|
| `community.docker does not support this ansible version` | Collection too new. Pin: `ansible-galaxy collection install "community.docker:==3.13.0"` |
| `Permission denied (publickey)` | Wrong key in inventory, or key permissions too open |
| `Missing sudo password` | Target lacks passwordless sudo — add `--ask-become-pass` |
| `changed` on every run | A `command`/`shell` task missing `changed_when` |
| Playbook finds no hosts | `ANSIBLE_CONFIG` unset (see §10) |

---

## 12. Secrets

Never put passwords in a playbook. Ansible Vault encrypts them at rest:

```bash
ansible-vault create secrets.yml
ansible-vault edit secrets.yml
ansible-playbook playbook.yml --ask-vault-pass
```

The encrypted file is safe to commit; the password is not.
