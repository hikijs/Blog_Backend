#!/bin/bash

# Default container name
CONTAINER_NAME="utils"

# Function to display usage information
display_usage() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -h, --help      Show helper"
  echo "  -s, --setup     Run the database setup script"
  echo "  -c, --cleanup   Run the database cleanup script"
  echo "  -b, --backup    Run the database backup script"
  echo "  -r, --restore   Run the database restore script"
  echo "  -t, --test      Use the 'utils_test' container"
}

# Process command-line options
while [[ $# -gt 0 ]]; do
  key="$1"
  case "$key" in
    --setup | -s | --cleanup | -c | --backup | -b | --restore | -r)
      if [ "$CONTAINER_NAME" == "utils" ]; then
        if [[ "$*" == *"-t"* ]] || [[ "$*" == *"--test"* ]]; then
          CONTAINER_NAME="utils_test"
        fi
      fi
      case "$key" in
        --setup | -s)
          docker exec "$CONTAINER_NAME" db_manager --setup
          ;;
        --cleanup | -c)
          docker exec -it "$CONTAINER_NAME" db_manager --cleanup
          ;;
        --backup | -b)
          docker exec "$CONTAINER_NAME" db_manager --backup
          ;;
        --restore | -r)
          docker exec "$CONTAINER_NAME" db_manager --restore
          ;;
      esac
      ;;
    --test | -t)
      CONTAINER_NAME="utils_test"
      ;;
    --help | -h)
      display_usage
      exit 0
      ;;
    *)
      echo "Invalid option: $key"
      display_usage
      exit 1
      ;;
  esac
  shift
done
