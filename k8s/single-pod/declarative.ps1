# Validate YAML file + review plan
kubectl create -f single-pod.yml --dry-run=client --validate=true

# Creation with either 'create' or 'apply'
kubectl create -f single-pod.yml --save-config
kubectl apply -f single-pod.yml 

# Get Pod details including annotions
kubectl get pod k8sspotlight -o yaml -n spotlight

# Get more information including events
kubectl describe pod k8sspotlight -n spotlight

# Open up a shell in the pod
kubectl exec -n spotlight k8sspotlight- -it -- sh

# Delete the pod
kubectl delete -f single-pod.yml
kubectl get pods