# Use official JupyterLab image as the base image
FROM jupyter/base-notebook:latest

# Switch to root user
USER root

# Run update and install python3, pip3, nodejs, npm
RUN apt-get update && \
    apt-get install -y python3 \
    python3-pip \
    nodejs \
    npm && \
    apt-get clean

# Install jupyterlab
RUN pip3 install jupyterlab

# Set the working directory to this folder
WORKDIR /extension

# Copy the current directory contents into the container at /extension
COPY . /extension

# Install file-saver
RUN npm install file-saver

# Run build
RUN npm run build

# Pip install all the requirements
RUN pip install -e .

# Link extension to jupyterlab  
RUN jupyter labextension develop . --overwrite

# Run build
RUN npm run build

# Expose the port for JupyterLab
EXPOSE 8888

# Start JupyterLab
CMD ["jupyter", "lab", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root"]