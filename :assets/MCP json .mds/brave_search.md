{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "brave_api_key",
        "description": "Brave Search API Key",
        "password": true
      }
    ],
    "servers": {
      "brave-search": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "-e",
          "BRAVE_API_KEY",
          "mcp/brave-search"
        ],
        "env": {
          "BRAVE_API_KEY": "${input:brave_api_key}"
        }
      }
    }
  }
}