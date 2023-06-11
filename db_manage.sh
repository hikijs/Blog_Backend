#!/bin/bash

# Function to display usage information
display_usage() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -h, --help      Show helper"
  echo "  -s, --setup     Run the database setup script"
  echo "  -c, --cleanup   Run the database cleanup script"
  echo "  -b, --backup    Run the database backup script"
  echo "  -r, --restore   Run the database restore script"
}

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
  display_usage
  exit 1
fi

# Process command-line options
case "$1" in
  --setup | -s)
    docker exec utils db_manager --setup
    ;;
  --cleanup | -c)
    docker exec -it utils db_manager --cleanup
    ;;
  --backup | -b)
    docker exec utils db_manager --backup
    ;;
  --restore | -r)
    docker exec utils db_manager --restore
    ;;
  --help | -h)
    display_usage
    exit 0
    ;;
  *)
    echo "Invalid option: $1"
    display_usage
    exit 1
    ;;
esac
