{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "gitlab_token",
        "description": "GitLab Personal Access Token",
        "password": true
      },
      {
        "type": "promptString",
        "id": "gitlab_url",
        "description": "GitLab API URL (optional)",
        "default": "https://gitlab.com/api/v4"
      }
    ],
    "servers": {
      "gitlab": {
        "command": "docker",
        "args": [
          "run",
          "--rm",
          "-i",
          "mcp/gitlab"
        ],
        "env": {
          "GITLAB_PERSONAL_ACCESS_TOKEN": "${input:gitlab_token}",
          "GITLAB_API_URL": "${input:gitlab_url}"
        }
      }
    }
  }
}