# Use the official Ubuntu image as the base image
FROM ubuntu:latest

# Install MySQL client
RUN apt-get update && apt-get install -y mysql-client && rm -rf /var/lib/apt/lists/*


# Set the environment variable to add a directory to PATH
ENV PATH="/script:${PATH}"

# Define two volume points for "script" and "data"
VOLUME /script
VOLUME /data

# Specify the command to run when the container starts
CMD ["tail", "-f", "/dev/null"]