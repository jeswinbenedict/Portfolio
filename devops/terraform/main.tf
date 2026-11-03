###############################################################################
# main.tf — provisions the AWS infrastructure that hosts the portfolio
#
# WHAT THIS CREATES
#   1. A security group  — the cloud firewall (which ports are open to whom)
#   2. A key pair        — the SSH public key used to log into the instance
#   3. An EC2 instance   — the virtual machine itself
#
# WHY TERRAFORM
#   In the Docker lab the EC2 instance was created by clicking through the AWS
#   console. That is not reproducible: nobody can tell later exactly which
#   settings were chosen, and rebuilding it means repeating every click.
#   Terraform describes the infrastructure as *code*, so the same environment
#   can be destroyed and recreated identically with one command, and the whole
#   definition lives in Git next to the application.
###############################################################################

terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# The provider is the plugin that knows how to talk to AWS's API.
# Credentials are NOT written here — Terraform reads them from the environment
# or from ~/.aws/credentials (see README, "Authentication").
provider "aws" {
  region = var.aws_region
}

###############################################################################
# Data source: find the newest official Ubuntu 24.04 AMI
#
# An AMI (Amazon Machine Image) is the disk image the VM boots from. AMI IDs
# differ per region and change when Canonical publishes updates, so hard-coding
# one would break. This looks the current one up at plan time instead.
###############################################################################
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical's official AWS account ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

###############################################################################
# Security group — the instance's firewall
#
# AWS denies all inbound traffic by default. Each `ingress` block opens one
# port. `egress` allows the instance to make outbound connections, which it
# needs in order to pull the image from Docker Hub.
###############################################################################
resource "aws_security_group" "portfolio" {
  name        = "${var.project_name}-sg"
  description = "Allow SSH and HTTP traffic to the portfolio container"

  ingress {
    description = "SSH for administration"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_allowed_cidr
  }

  ingress {
    description = "Portfolio application"
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP (nginx reverse proxy, once a domain is attached)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS (TLS via Let's Encrypt)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound (needed to pull from Docker Hub)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # -1 means every protocol
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-sg"
    Project = var.project_name
  }
}

###############################################################################
# Key pair — uploads your SSH *public* key to AWS
#
# The private half never leaves your machine. AWS installs the public half into
# the instance's ~/.ssh/authorized_keys at first boot, which is what lets you
# `ssh -i <key> ubuntu@<ip>` without a password.
###############################################################################
resource "aws_key_pair" "portfolio" {
  key_name   = "${var.project_name}-key"
  public_key = file(var.public_key_path)

  tags = {
    Project = var.project_name
  }
}

###############################################################################
# EC2 instance — the virtual machine
#
# user_data is a script AWS runs **once**, as root, on first boot. Using it
# means the server configures itself: no manual SSH session is required to get
# the application running. (Ansible, in ../ansible, is the alternative for
# repeatable configuration *after* boot — see devops/docs/04-ansible.md.)
###############################################################################
resource "aws_instance" "portfolio" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.portfolio.key_name
  vpc_security_group_ids = [aws_security_group.portfolio.id]

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    docker_image = var.docker_image
    app_port     = var.app_port
  })

  # Recreate the instance if the bootstrap script changes.
  user_data_replace_on_change = true

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"

    # Delete the disk when the instance is terminated, so a `terraform destroy`
    # leaves nothing behind that could still be billed.
    delete_on_termination = true
  }

  tags = {
    Name    = var.project_name
    Project = var.project_name
    Managed = "terraform"
  }
}
