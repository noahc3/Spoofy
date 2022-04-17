# create SpoofyAPI docker image from artifacts
LABEL org.opencontainers.image.source="https://github.com/noahc3/spoofy"
FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-alpine-amd64
WORKDIR /app
COPY ./app-linux-musl-x64 ./
ENTRYPOINT ["./SpoofyAPI"]
EXPOSE 80