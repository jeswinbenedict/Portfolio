###############################################################################
# outputs.tf — values Terraform prints after `apply`
#
# Outputs are how one piece of automation hands information to the next. The
# Ansible inventory, for example, needs the instance's public IP, and that IP
# is not known until AWS has actually created the machine.
#
# Read a single value later with:  terraform output -raw public_ip
###############################################################################

output "public_ip" {
  description = "Public IPv4 address of the instance. This is what you type into the browser."
  value       = aws_instance.portfolio.public_ip
}

output "public_dns" {
  description = "AWS-assigned hostname. Works like the IP but survives a stop/start cycle."
  value       = aws_instance.portfolio.public_dns
}

output "instance_id" {
  description = "EC2 instance ID, e.g. i-0abc123. Used when looking it up in the console."
  value       = aws_instance.portfolio.id
}

output "app_url" {
  description = "Full URL of the running portfolio."
  value       = "http://${aws_instance.portfolio.public_ip}:${var.app_port}"
}

output "ssh_command" {
  description = "Ready-to-paste command for logging into the instance."
  value       = "ssh -i ${replace(var.public_key_path, ".pub", "")} ubuntu@${aws_instance.portfolio.public_ip}"
}

output "ansible_inventory_line" {
  description = "Paste this into devops/ansible/inventory.ini to point Ansible at the new instance."
  value       = "portfolio ansible_host=${aws_instance.portfolio.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=${replace(var.public_key_path, ".pub", "")}"
}
