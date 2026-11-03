###############################################################################
# variables.tf — the inputs to this configuration
#
# Every value that might differ between people or environments lives here
# rather than being hard-coded in main.tf. Terraform reads actual values from
# terraform.tfvars, from -var flags, or falls back to the defaults below.
###############################################################################

variable "project_name" {
  description = "Prefix applied to the name of every resource, so they are easy to find and delete."
  type        = string
  default     = "portfolio"
}

variable "aws_region" {
  description = "AWS region to deploy into. Pick the one closest to you for lower latency."
  type        = string
  default     = "eu-north-1" # Stockholm — the region used in the Docker lab
}

variable "instance_type" {
  description = "EC2 instance size. t3.micro is Free Tier eligible (750 h/month for 12 months)."
  type        = string
  default     = "t3.micro"
}

variable "root_volume_size" {
  description = "Root disk size in GB. Free Tier includes 30 GB of EBS."
  type        = number
  default     = 8

  validation {
    condition     = var.root_volume_size >= 8 && var.root_volume_size <= 30
    error_message = "Keep the volume between 8 and 30 GB to stay inside the Free Tier."
  }
}

variable "public_key_path" {
  description = "Path to your SSH PUBLIC key. Generate with: ssh-keygen -t ed25519 -f ~/.ssh/portfolio"
  type        = string
  default     = "~/.ssh/portfolio.pub"
}

variable "docker_image" {
  description = "The image the instance pulls and runs on first boot."
  type        = string
  default     = "jechuimmanuel/portfolio:v2"
}

variable "app_port" {
  description = "Host port the container is published on."
  type        = number
  default     = 3000
}

variable "ssh_allowed_cidr" {
  description = <<-EOT
    Who may reach port 22. ["0.0.0.0/0"] means the whole internet, which is
    acceptable for a short-lived lab instance because AWS's Ubuntu images
    disable password login entirely — only your private key works.

    To restrict it to your own address instead, use ["<your-ip>/32"]. Note that
    many home and mobile ISPs rotate your public IP, which will silently lock
    you out when it changes (this happened during the Docker lab).
  EOT
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
