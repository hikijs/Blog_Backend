#!/bin/bash
UPGRADE_FILE="upgrade.json"
# Initialize password variable
PASSWORD=""

# Parse command-line options and arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -p)
      if [ -n "$2" ]; then
        PASSWORD="$2"
        shift
      else
        read -s -p "Enter password: " PASSWORD
      fi
      shift
      ;;
    *)
      break
      ;;
  esac
done

# Check if a password is provided
if [ -z "$PASSWORD" ]; then
  echo -e "${RED}Please provide a password using the -p option${NC}"
  exit 1
fi

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source environment variables
source "$SCRIPT_DIR/config.cfg"
source "$SCRIPT_DIR/.env"

# Navigate to the project directory (two levels up)
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Read the backend version from JSON
BACKEND_VERSION=$(jq .backend "$UPGRADE_FILE" | tr -d '"')

echo -e "${YELLOW}The Backend version to be built is $BACKEND_VERSION${NC}"

# Build the Docker image
IMAGE_NAME="hunghoang149/blog:$BACKEND_VERSION"
echo -e "${BLUE}Starting Docker image build: $IMAGE_NAME${NC}"

# Build the Docker image
echo "$PASSWORD" | sudo -S docker build . -t "$IMAGE_NAME"
if [ $? -ne 0 ]; then
  echo -e "${RED}Docker build failed.${NC}"
  exit 1
fi

# Push the Docker image to DockerHub
sudo -S docker login -u "$DOCKER_USER" -p "$DOCKER_PASSWORD"
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to log in to Docker Registry.${NC}"
  exit 1
fi

echo "$PASSWORD" | sudo -S docker push "$IMAGE_NAME"
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to push to DockerHub.${NC}"
  exit 1
fi

echo -e "${GREEN}Docker Build and Push to DockerHub completed successfully.${NC}"
exit 0