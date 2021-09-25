FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS build
WORKDIR /build

RUN apk update \
    && apk add --no-cache npm

# Copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore -r linux-musl-x64

# Copy everything else
COPY . ./
RUN dotnet publish -c Release -r linux-musl-x64 --no-restore -o out

FROM mcr.microsoft.com/dotnet/aspnet:5.0-alpine as package
LABEL maintainer="jean.frederic.faust@gmail.com"

RUN apk update \
    && apk add --no-cache gcompat \
    && apk add --no-cache libunwind \
    && apk add --no-cache libuuid \
    && apk add --no-cache icu-libs \
    && apk add --no-cache openssl

#ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /build/out App/
WORKDIR /App
ENTRYPOINT ["dotnet", "Spotlight.Website.dll"]