#!/bin/bash
# pull the repository
echo hunghoang
# Store the name of the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
git stash
# Get the directory of the current script (i.e., 'start.sh')
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Navigate to the project directory (two levels up)
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd $PROJECT_DIR

# Use mkdir with -p option to create the "data" folder if it does not exist
mkdir -p "data"

# check out to branch dev and pull
git checkout dev
git pull

# create a network for blog
# Name of the Docker network to check
NETWORK_NAME="blog_network"

# Use 'docker network inspect' to check if the network exists
if docker network inspect "$NETWORK_NAME" &>/dev/null; then
  	echo "The Docker network '$NETWORK_NAME' exists."
else
  	echo "The Docker network '$NETWORK_NAME' does not exist."
	# Use 'docker network create' to create the network
	if sudo docker network create -d bridge "$NETWORK_NAME"; then
		echo "The Docker network '$NETWORK_NAME' has been successfully created."
	else
		echo "Failed to create the Docker network '$NETWORK_NAME'."
		git checkout "$CURRENT_BRANCH"
		git stash pop stash@\{0\}
		exit 1  # Terminate the script with a non-zero exit status
	fi
fi
# # start docker compose up
sudo docker compose down
sudo docker compose up -d
git checkout "$CURRENT_BRANCH"
git stash pop stash@\{0\}