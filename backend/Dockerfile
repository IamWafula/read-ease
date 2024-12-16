# While this docker file works perfectly fine, workarounds have been used to ensure google Ai driver works.
# Long term, the application should be run on a linux machine
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# temp solution for API keys
ENV API_KEY=AIzaSyACZBEu1L17Lr83R2xczi-G71W6FBG2xBA
ENV JWT_SECRET_KEY=89cf93ad3bb5da616960828750cd6c7b4f4e89eb5c5ba23bbad04dde30a2453af18928ac8bba4432113c8181c3930d6de0f31111294b12f54bb02036aee3631b43aae50748d8a1b630e40b9109da81a48f41cff843987683f77f8a395f0699e6c4e30f4c79ff1c91cc12a416b710b1ae55272fc8cd6a3dffb6d2146e74bec009d7a6d33a16b13bb4d6f0d7e21b6d079674f3ddd916c37f4c61cc9bdf217467377f56fc21d982bdcaa7c36c1d7dd98ef5ea2ef2394d1c90985581ffe8151fc3e73a85d179004420b7f362743972c6a54b129e5fcf432e7d69d49a4932b7fb85f45bbafc1899741aad00ac6535ceb333889248b0aa6c2935fd24bfea35f511d301
ENV ENV=production
ENV MONGO_URI=mongodb+srv://ian:root@read-ease.1wifp.mongodb.net/?retryWrites=true&w=majority&appName=read-ease


# Install necessary system packages, including g++
# workaround for google Ai driver
RUN apt-get update && apt-get install -y g++

# install google Ai driver
RUN pip3 install -q -U google-generativeai
RUN pip3 install firebase_admin
RUN pip3 install redis
RUN pip3 install pymongo
RUN pip3 install motor

# Upgrade pip, as the version in the base image is out of date 
RUN pip3 install pip --upgrade

# Install any needed packages specified in requirements.txt
RUN pip3 install -r requirements.txt

# Make port 3000 available to the world outside this container
EXPOSE 3000

CMD ["python3", "asgi.py"]