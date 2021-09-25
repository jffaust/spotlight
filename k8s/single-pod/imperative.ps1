# Raw kubectl commands to get Spotlight running on the current K8s cluster
kubectl get pods

kubectl run k8sspotlight --image=spotlightviz/spotlight:latest -n spotlight

kubectl get pods

kubectl port-forward k8sspotlight 8080:80 -n spotlight

kubectl delete pods k8sspotlight -n spotlight

kubectl get pods