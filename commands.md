aws lightsail push-container-image --service-name read-ease --label read-ease-service --image read-ease-repo

sudo aws lightsail push-container-image --region us-east-1 --service-name read-ease --label read-ease-service --image read-ease-repo

sudo aws lightsail push-container-image --region us-east-1 --service-name read-ease --label read-ease-service --image backend-backend

docker tag backend-backend:latest 677276084427.dkr.ecr.us-east-1.amazonaws.com/reade-ease-repo:latest

aws ecr get-login-password --region us-east-1 | docker login -u wafula -p "cL@sA1}z" 677276084427.signin.aws.amazon.com
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 677276084427.dkr.ecr.us-east-1.amazonaws.com

aws lightsail create-container-service-deployment --service-name read-ease --containers file://containers.json --public-endpoint file://public-endpoint.json

aws lightsail create-container-service-deployment --service-name read-ease --public-endpoint file://public-endpoint.json


docker login -u ian -p "cL@sA1}z" https://677276084427.signin.aws.amazon.com
access key : AKIAZ3MGM5DFT2JL2BXQ
secret : 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