## Generating SSL Key

```sudo apt update
sudo apt install openssl -y
````

``` 
openssl genrsa -out key.pem 2048 
```

```
openssl req -new -x509 -key key.pem -out cert.pem -days 365
```

* -new -x509: Creates a new self-signed certificate.
* -key key.pem: Uses the private key.
* -out cert.pem: Saves the certificate as cert.pem.
* -days 365: The certificate will be valid for 1 year.