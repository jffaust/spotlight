helm lint # From inside the spotlight chart folder

helm package spotlight # From outside

helm install spotlight ./spotlight-0.1.0.tgz