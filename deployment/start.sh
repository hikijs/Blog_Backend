#!/bin/bash
# determine version to start
UPGRADE_FILE="upgrade.json"
unset BACKEND_VERSION
CHECKED_OUT=false
# resetwhen done

resetWorkDir() {
	git checkout "$CURRENT_BRANCH"
	git stash pop stash@\{0\}
}
exitFailure () {
	resetWorkDir
	exit 1
}

exitSuccess () {
	resetWorkDir
	exit 0
}

# Function to handle Ctrl+C
ctrl_c() {
  echo "Restoring the previous state"
  if [ $CHECKED_OUT = true ]; then
  	exitFailure
  fi
  exit 1
}

# Set up the trap to call the ctrl_c function when Ctrl+C is received
trap ctrl_c INT

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

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source environment variables
source "$SCRIPT_DIR/config.cfg"
source "$SCRIPT_DIR/.env"


# Check if a password is provided
if [ -z "$PASSWORD" ]; then
  echo "${RED}Please provide a password using the -p option${NC}"
  exit 1
fi

# Store the name of the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
git stash save -m "TEMPORARY save the working space when start backend"

if [ $? -ne 0 ]; then
	echo "${RED}There is some happen when stash working directory${NC}"
fi

# Navigate to the project directory (two levels up)
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd $PROJECT_DIR
BACKEND_VERSION=$(jq .backend $UPGRADE_FILE | tr -d '"')
echo "${YELLOW}The Backend version to be used is $BACKEND_VERSION${NC}"

# Use mkdir with -p option to create the "data" folder if it does not exist
mkdir -p "data"
echo "!!!! Thinking before switching to dev"

spin_chars="/-\|"
for ((i = 0; i < 40; i++)); do
  char="${spin_chars:i % 4:1}"
  echo -n -e "\r$char"
  sleep 0.1
done


# check out to branch dev and pull
git checkout dev
if [ $? -eq 0 ]; then
	CHECKED_OUT=true
fi

git pull

if [ $? -ne 0 ]; then
	echo "${RED}There is some happen when pulling project${NC}"
	exitFailure
fi

# create a network for blog
# Name of the Docker network to check
NETWORK_NAME="blog_network"
echo "$PASSWORD" | sudo -S docker network inspect "$NETWORK_NAME" &>/dev/null
if [ $? -eq 0 ]; then
  	echo "${YELLOW}The Docker Network '$NETWORK_NAME' Exist.${NC}"
else
  	echo "${BLUE}The Docker Network '$NETWORK_NAME' Does Not Exist.${NC}"
	# Use 'docker network create' to create the network\
	echo "$PASSWORD" | sudo -S docker network create -d bridge "$NETWORK_NAME"
	if [ $? -eq 0 ]; then
		echo "The Docker network '$NETWORK_NAME' has been successfully created."
	else
		echo "Failed to create the Docker network '$NETWORK_NAME'."
		exitFailure
	fi
fi
# start docker compose up
echo ">>> Starting docker compose down"
echo "$PASSWORD" | sudo -S docker compose down
if [ $? -ne 0 ]; then
	echo "${RED}Can not down the compose${NC}"
	exitFailure
fi

echo ">>> Starting docker compose up version backend is $BACKEND_VERSION"
echo "$PASSWORD" | sudo -S env BACKEND_VERSION=$BACKEND_VERSION docker compose up -d --build &>/dev/null
if [ $? -ne 0 ]; then
	echo "${RED}Can not start compose${NC}"
	exitFailure
fi

echo "Docker compose up completed"
echo "Monitor by docker compose logs -f"
exitSuccess