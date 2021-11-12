FROM docker.io/alpine:latest

ARG RELEASE_VERSION=0.15.0
ENV REPO_PATH=/github/workspace

COPY entrypoint.sh /entrypoint.sh

RUN apk add --no-cache git jq && \
    cd /tmp && \
    wget -O git-chglog.tar.gz \
    https://github.com/git-chglog/git-chglog/releases/download/v${RELEASE_VERSION}/git-chglog_${RELEASE_VERSION}_linux_amd64.tar.gz && \
    tar xvf git-chglog.tar.gz && \
    mv git-chglog /bin && \
    chmod 755 /bin/git-chglog

ENTRYPOINT [ "/entrypoint.sh" ]
