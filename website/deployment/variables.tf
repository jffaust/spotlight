variable "environment" {
  type = string
}

variable "resource_index" {
  type    = string
  default = "01"
}

variable "region" {
  type = string
}

variable "tags" {
  type = map(any)
}

variable "ado_project_id" {
  type = string
}

variable "ado_deployment_pipelines_path" {
  type = string
}

variable "ado_build_pipeline_id" {
  type = string
}

variable "git_default_branch" {
  type = string
}

variable "github_repo_id" {
  type = string
}

variable "github_service_connection_id" {
  type = string
}

variable "azure_subscription_connection" {
  type = string
}

variable "docker_registry" {
  type    = string
  default = "docker.io"
}

variable "docker_repository" {
  type    = string
  default = "spotlightviz/spotlight"
}

variable "enable_azure_storage" {
  type    = bool
  default = false
}
