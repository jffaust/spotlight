kubectl apply -f service.yml

kubectl get services spotlight-np -n spotlight
kubectl describe service spotlight-np -n spotlight

# Minikube requires additional tunneling to work. Choose either:
minikube service spotlight-np # app accessible from localhost:X
kubectl port-forward service/spotlight-np 8080:8080 -n spotlight # app accessible from localhost:8080