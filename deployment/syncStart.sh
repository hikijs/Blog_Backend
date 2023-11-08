#!/bin/bash
# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Source environment variables
source "$SCRIPT_DIR/config.cfg"
source "$SCRIPT_DIR/.env"

BRANCH_NAME=dev

# Store the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CHECKED_OUT=false

checkout() {
	git stash save -m 'TEMPORATY SAVING FOR DEPLOYMENT'
	git checkout "$BRANCH_NAME"
}

pull() {
	git pull
}

resetWorkDir() {
	echo -e "${YELLOW}>> BACK TO CURRENT WORKING DIR${NC}"
	git checkout "$CURRENT_BRANCH"
	git stash pop stash@\{0\}
}

exitFailure () {
	resetWorkDir
	echo -e "${RED}>> EXIT WITH ISSUE${NC}"
	exit 1
}

exitSuccess () {
	resetWorkDir
	echo -e "${GREEN}>> COMPLETED SUCCESSFULLY${NC}"
	exit 0
}

# Function to handle Ctrl+C
ctrl_c() {
  echo -e "Restoring the previous state"
  if [ $CHECKED_OUT = true ]; then
  	exitFailure
  fi
  exit 1
}

# Set up the trap to call the ctrl_c function when Ctrl+C is received
trap ctrl_c INT

echo -e "${YELLOW}>> We Have 5s before switching to $BRANCH_NAME${NC}"
spin_chars="/-\|"
for ((i = 0; i < 50; i++)); do
  char="${spin_chars:i % 4:1}"
  printf "\r$char"
  sleep 0.1
done
echo


echo -e "${BLUE}>> START CHECKOUT TO $BRANCH_NAME${NC}"
checkout

if [ $? -ne 0 ]; then
	echo -e "${RED}Can not check out to $BRANCH_NAME${NC}"
	exitFailure
fi

echo -e "${BLUE}>> START PULLING NEW CODE FOR $BRANCH_NAME${NC}"
pull

if [ $? -ne 0 ]; then
	echo -e "${RED}Can not pull lastest code for $BRANCH_NAME branch${NC}"
	exitFailure
fi

# trigger start
echo -e "${BLUE}>> START DOCKER COMPOSE FOR BLOG BACKEND${NC}"
$SCRIPT_DIR/start.sh -p $USER_PASSWORD

if [ $? -eq 0 ]; then
	exitSuccess
else
	exitFailure
fi


