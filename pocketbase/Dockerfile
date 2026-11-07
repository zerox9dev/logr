# Production PocketBase for logr (the `pocketbase` service in Openship).
#
# Rebuilds the image Openship's PocketBase template produced on the server
# (logr-pocketbase:latest), which existed only there: same Alpine, the same
# official binary (sha256 checked below), the same entrypoint and command, so
# the data in the pocketbase_data volume (/pb/pb_data) opens unchanged.
# CI pushes it as ghcr.io/zerox9dev/logr-pocketbase:<version>.
#
# Upgrading PocketBase: change PB_VERSION and PB_SHA256 (from the release's
# checksums.txt) together, and take a backup of the volume first.
FROM alpine:3.24.1 AS download
ARG PB_VERSION=0.40.1
ARG PB_SHA256=0f3442d2e57b03b56fbff0d09289e4a30b4f561a44338c38d2dcd4a1a0cfa91e
RUN wget -q -O /tmp/pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    && echo "${PB_SHA256}  /tmp/pb.zip" | sha256sum -c - \
    && unzip -q /tmp/pb.zip pocketbase -d /out

FROM alpine:3.24.1
RUN apk add --no-cache ca-certificates su-exec \
    && addgroup -S pocketbase \
    && adduser -S -G pocketbase -h /pb pocketbase
COPY --from=download --chown=pocketbase:pocketbase /out/pocketbase /pb/pocketbase
COPY --chown=pocketbase:pocketbase entrypoint.sh /pb/entrypoint.sh
RUN chmod 755 /pb/entrypoint.sh
WORKDIR /pb
ENTRYPOINT ["/pb/entrypoint.sh"]
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--encryptionEnv=PB_ENCRYPTION_KEY"]
