# While this docker file works perfectly fine, workarounds have been used to ensure google Ai driver works.
# Long term, the application should be run on a linux machine
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# temp solution for API keys
# ENV API_KEY=AIzaSyACZBEu1L17Lr83R2xczi-G71W6FBG2xBA


# Install necessary system packages, including g++
# workaround for google Ai driver
RUN apt-get update && apt-get install -y g++

# install google Ai driver
RUN pip3 install -q -U google-generativeai
RUN pip3 install firebase_admin

# Upgrade pip, as the version in the base image is out of date 
RUN pip3 install pip --upgrade

# Install any needed packages specified in requirements.txt
RUN pip3 install -r requirements.txt

# Make port 3000 available to the world outside this container
EXPOSE 3000

CMD ["python", "asgi.py"]