#!/bin/bash

UPGRADE_FILE="upgrade.json"
unset BACKEND_VERSION
# Get the directory of the current script (i.e., 'start.sh')
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source environment variables
source "$SCRIPT_DIR/config.cfg"
source "$SCRIPT_DIR/.env"

# Navigate to the project directory (two levels up)
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd $PROJECT_DIR

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

echo -e "${YELLOW}>> We Have 5s Before Down Blog BackEnd${NC}"
spin_chars="/-\|"
for ((i = 0; i < 50; i++)); do
  char="${spin_chars:i % 4:1}"
  printf "\r$char"
  sleep 0.1
done
echo

echo -e "${BLUE}>> Checking Utils Container Is Existing Or Not${NC}"
# backup data
echo "$PASSWORD" | sudo -S docker ps -q --filter "name=^/utils$" | grep -q .
if [ $? -eq 0 ]; then
  	echo -e "${BLUE}>> Executing BackUp Data${NC}"
	./db_manage.sh -b
else
  	echo -e "${RED}Can Not BackUp Data The Container Does Not Existing${NC}"
	exit 1
fi

BACKEND_VERSION=$(jq .backend $UPGRADE_FILE | tr -d '"')
echo -e "${YELLOW}The Backend Version Was Using: $BACKEND_VERSION${NC}"

# down docker 
echo "$PASSWORD" | sudo -S BACKEND_VERSION=$BACKEND_VERSION docker compose down
if [ $? -eq 0 ]; then
	echo -e "${GREEN} Completed Stop All Container In Docker Compose${NC}"
else
	echo -e "${RED} Issue Happen When Docker Compose Down${NC}"
fi