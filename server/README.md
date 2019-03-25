# Local Development

## On macOS

Ensure `librdkafka` is installed using `brew install librdkafka`. Then use the following command to install
dependencies:

```
CPPFLAGS=-I/usr/local/opt/openssl/include LDFLAGS=-L/usr/local/opt/openssl/lib npm install
```
