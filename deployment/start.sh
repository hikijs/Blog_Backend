#!/bin/bash
# determine version to start
UPGRADE_FILE="upgrade.json"
unset BACKEND_VERSION

exitFailure () {
	exit 1
}

exitSuccess () {
	exit 0
}
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
  echo -e "${RED}Please provide a password using the -p option${NC}"
  exitFailure
fi

# Navigate to the project directory (two levels up)
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd $PROJECT_DIR

# create data for storing mysql data
mkdir -p "data"

# create a network for blog
NETWORK_NAME="blog_network"
echo -e "${BLUE}>> CREATE NETWOKR $NETWORK_NAME FOR BLOG${NC}"

echo "$PASSWORD" | sudo -S docker network inspect $NETWORK_NAME &>/dev/null
if [ $? -eq 0 ]; then
  	echo -e "${YELLOW}The Docker Network'$NETWORK_NAME' Exist${NC}"
else
  	echo -e "${YELLOW}The Docker Network'$NETWORK_NAME' Does Not Exist${NC}"
	# Use 'docker network create' to create the network\
	echo "$PASSWORD" | sudo -S docker network create -d bridge "$NETWORK_NAME"
	if [ $? -eq 0 ]; then
		echo -e "${GREEN}The Docker Network '$NETWORK_NAME' has been successfully created.${NC}"
	else
		echo -e "${RED}Failed To Create Docker Network'$NETWORK_NAME'.${NC}"
		exitFailure
	fi
fi

BACKEND_VERSION=$(jq .backend $UPGRADE_FILE | tr -d '"')
echo -e "${YELLOW}The Backend Version Should Be Used: $BACKEND_VERSION${NC}"

# start docker compose down
echo -e "${BLUE}>>Trigger Docker Compose Down${NC}"
echo "$PASSWORD" | sudo -S env BACKEND_VERSION=$BACKEND_VERSION docker compose down
if [ $? -ne 0 ]; then
	echo -e "${RED}Issue Happen When Docker Compose Down${NC}"
	exitFailure
fi

echo -e "${BLUE}>> Docker Compose Up For Backend Version: $BACKEND_VERSION${NC}"
echo "$PASSWORD" | sudo -S env BACKEND_VERSION=$BACKEND_VERSION docker compose up -d --build
if [ $? -ne 0 ]; then
	echo -e "${RED}Issue Happen When Docker Compose Up -d --build${NC}"
	exitFailure
fi

echo -e "${GREEN}>> Docker Compose Up Completed${NC}"
echo -e "${YELLOW}>> Motitor by Command: "docker compose logs -f"${NC}"
exitSuccess