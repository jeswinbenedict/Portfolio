# Terraform — Infrastructure as Code

---

## 1. Why not just click in the console

In the Docker lab the EC2 instance was created by clicking through the AWS
console. It worked — and then it was gone, and nobody could say exactly which
settings produced it.

Clicking is **imperative** ("do this, then this") and leaves no record.
Terraform is **declarative**: you describe the infrastructure you want, and it
works out the difference between that and reality.

Four things you get:

1. **Reproducible** — `destroy` then `apply` gives an identical environment.
2. **Reviewable** — infrastructure changes arrive as a pull request diff.
3. **Versioned** — `git log` shows who changed the firewall and when.
4. **Documented** — the `.tf` files *are* the documentation, and cannot drift.

---

## 2. Terraform vs Ansible

The most likely viva question. They are complementary, not competing:

| | Terraform | Ansible |
|---|---|---|
| Job | **Provisioning** — create the machine | **Configuration** — set up what runs on it |
| Model | Declarative, builds a dependency graph | Mostly procedural, tasks in order |
| State | Keeps a state file | Stateless; inspects the live host |
| Here | Creates EC2, security group, key pair | Installs Docker, runs the container |

Terraform builds the house; Ansible furnishes it.

---

## 3. The files

| File | Role |
|---|---|
| `main.tf` | The resources — provider, AMI lookup, security group, key pair, instance |
| `variables.tf` | Inputs, with defaults and validation |
| `outputs.tf` | Values printed after apply (public IP, SSH command) |
| `terraform.tfvars` | Your actual values — **gitignored** |
| `user_data.sh.tftpl` | Bootstrap script run once on first boot |

---

## 4. Core concepts

### Providers

The plugin that speaks a platform's API. Downloaded by `terraform init` into
`.terraform/`.

```hcl
provider "aws" {
  region = var.aws_region
}
```

**Credentials are deliberately absent.** Terraform reads them from the
environment or `~/.aws/credentials`. Hard-coding keys in a `.tf` file commits
them to Git — the single most common way AWS keys leak.

### Resources

One real object each: `resource "<type>" "<local name>"`.

```hcl
resource "aws_instance" "portfolio" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
}
```

### Data sources — read, don't create

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]   # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}
```

AMI IDs differ per region and change when Canonical publishes updates, so a
hard-coded ID breaks. This looks up the current one at plan time.

### Implicit dependency graph

```hcl
vpc_security_group_ids = [aws_security_group.portfolio.id]
```

By *referencing* the security group, you tell Terraform the instance depends
on it. It builds a graph and orders operations automatically — no manual
sequencing, and independent resources are created in parallel.

---

## 5. State — the concept people get asked about

`terraform.tfstate` maps your configuration to real resource IDs:

```
aws_instance.portfolio   →   i-0abc123def456
```

Without it, Terraform has no idea that the `aws_instance.portfolio` block
corresponds to an existing machine — it would try to create a second one.

Three consequences:

- **It can contain secrets in plain text.** Hence gitignored.
- **It must not be edited by hand.** Use `terraform state` subcommands.
- **It causes conflicts if shared via Git.** Real teams use a remote backend —
  S3 for storage plus DynamoDB for locking, so two engineers cannot apply at
  once.

---

## 6. The workflow

```bash
terraform init       # download providers        (needs internet, once)
terraform fmt        # canonical formatting
terraform validate   # syntax + type check       (works OFFLINE)
terraform plan       # show what would change    (contacts AWS)
terraform apply      # make it so
terraform destroy    # tear it all down
```

Reading a plan:

| Symbol | Meaning |
|---|---|
| `+` | create |
| `-` | destroy |
| `~` | modify in place |
| `-/+` | **destroy and recreate** — look twice at these |

`plan` changes nothing. It is always safe to run, and you should always read
it before `apply`.

### Verified on this machine

```
$ terraform init
Terraform has been successfully initialized!

$ terraform validate
Success! The configuration is valid.
```

`validate` needs no AWS credentials and no internet — useful for an offline demo.

---

## 7. Variables and outputs

```hcl
variable "root_volume_size" {
  type    = number
  default = 8
  validation {
    condition     = var.root_volume_size >= 8 && var.root_volume_size <= 30
    error_message = "Keep the volume between 8 and 30 GB to stay inside the Free Tier."
  }
}
```

Validation catches a costly mistake *before* anything is created.

Outputs hand values to the next tool:

```bash
terraform output -raw public_ip
terraform output -raw ansible_inventory_line   # paste straight into Ansible
```

---

## 8. `user_data` — self-configuring servers

A script AWS runs once, as root, on first boot. Ours installs Docker, pulls
the image and starts the container, so the instance is serving without anyone
logging in.

```bash
user_data_replace_on_change = true   # changing the script rebuilds the instance
```

Debugging: the output lands in `/var/log/cloud-init-output.log` on the
instance. That is the first place to look if the app is not up.

**`user_data` vs Ansible?** `user_data` runs *once* and only at creation.
Ansible can be re-run any time against an existing fleet. Use `user_data` for
first boot, Ansible for ongoing configuration.

---

## 9. Running it

```bash
wsl -d Ubuntu
cd /mnt/c/Users/jeswi/OneDrive/Desktop/portfolio/devops/terraform

aws configure          # your AWS key, secret, region
ssh-keygen -t ed25519 -f ~/.ssh/portfolio -N ""

cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply        # type: yes

terraform output app_url
```

⚠ **Always finish with `terraform destroy`.** A running instance bills, and a
stopped one still bills for its EBS volume.

---

## 10. Common failures

| Error | Cause |
|---|---|
| `No valid credential sources found` | `aws configure` not run |
| `InvalidKeyPair.Duplicate` | Key name already exists — rename or delete it |
| `UnauthorizedOperation` | IAM user lacks EC2 permissions |
| `Error acquiring the state lock` | A previous run crashed — `terraform force-unlock <id>` |
| Instance created but app unreachable | Security group port rule missing, or check cloud-init log |
