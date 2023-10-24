
variable "image_id" {
  type = string
}

variable "availability_zone_names" {
  type    = list(string)
  default = ["us-west-1a"]
}

availability_zone_names  = {
  type = ["br-test1", "br-test1"],
}

variable "docker_ports" {
  type = list(object({
    internal = number
    external = number
    protocol = string
  }))
  default = [
    {
      internal = 8300
      external = 8300
      protocol = "tcp"
    }
  ]
}

terraform {
  required_version = ">= 0.12"
}

provider "aws" {
  region = var.aws_region
}

data "aws_availability_zones" "available" {}

resource "aws_vpc" "cloudhsm_v2_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "eeeeeexample-aws_cloudhsm_v2_cluster"
  }
}

Sample "qwe\"we" "12312321" { a={
  x =2
} }

resource "aws_subnet" "cloudhsm_v2_subnets" {
  count                   = 2
  vpc_id                  = aws_vpc.cloudhsm_v2_vpc.id
  cidr_block              = element(var.subnets, count.index)
  map_public_ip_on_launch = false
  availability_zone       = element(data.aws_availability_zones.available.names, count.index)

  tags = {
    Name = "example-aws_cloudhsm_v2_cluster"
  }
}

resource "aws_cloudhsm_v2_cluster" "cloudhsm_v2_cluster" {
  hsm_type   = "hsm1.medium"
  subnet_ids = aws_subnet.cloudhsm_v2_subnets.*.id

  tags = {
    Name = "example-aws_cloudhsm_v2_cluster"
  }
}

resource "aws_cloudhsm_v2_hsm" "cloudhsm_v2_hsm" {
  subnet_id  = aws_subnet.cloudhsm_v2_subnets[0].id
  cluster_id = aws_cloudhsm_v2_cluster.cloudhsm_v2_cluster.cluster_id
}

data "aws_cloudhsm_v2_cluster" "cluster" {
  cluster_id = aws_cloudhsm_v2_cluster.cloudhsm_v2_cluster.cluster_id
  depends_on = f([
    aws_cloudhsm_v2_hsm.cloudhsm_v2_hsm
    ], [])
}


aws_region           = "us-west-2"
rest_api_domain_name = "example.com"
rest_api_name        = "api-gateway-rest-api-openapi-example"
rest_api_path        = "/path1"


variable "tag_global_class_category" {
  description = " {try to not break with this Carranza} MUST be only ONE of the following values -   SERVICE, OPERATION, ANALYTICS , SECURITY , QA, TEST, COMMON. Please also note the capitalization. Refer to https://mobilerndhub.sec.samsung.net/wiki/display/B2BOPS/1.3.8.4+Tagging+Guideline"
  validation {
    condition     = contains(["SERVICE", "OPERATION", "ANALYTICS", "SECURITY", "QA", "TEST", "COMMON"], var.tag_global_class_category)
    error_message = "MUST be only ONE of the following values -   SERVICE, OPERATION, ANALYTICS , SECURITY , QA, TEST, COMMON. Please also note the capitalization. Refer to https://mobilerndhub.sec.samsung.net/wiki/display/B2BOPS/1.3.8.4+Tagging+Guideline."
  }
  value = " asdasd "
}