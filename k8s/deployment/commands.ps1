cd .\k8s\deployment\

# Create namespace
kubectl create namespace spotlight

# Apply the ConfigMap first
kubectl apply -f ./configmap/configMap.yml
kubectl describe configmap app-settings -n spotlight

# Deploy the app
kubectl apply -f deployment.yml
kubectl describe deployment k8sspotlight -n spotlight

# Apply a LoadBalancer service
kubectl apply -f ./service/loadbalancer/service.yml
minikube service spotlight-lb -n spotlight