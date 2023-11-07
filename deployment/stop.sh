# Get the directory of the current script (i.e., 'start.sh')
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Navigate to the project directory (two levels up)
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd $PROJECT_DIR

# backup data
if sudo sudo docker ps -q -f name=utils | grep -q .; then
  	echo "Executing backup data"
	./db_manage.sh -b
else
  	echo "Can not backup data, might be the server does not start yet"
	exit 1  # Terminate the script with a non-zero exit status
fi
# down docker 
sudo docker compose down
