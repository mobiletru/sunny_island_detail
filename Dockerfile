ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.21
FROM ${BUILD_FROM}

ARG BUILD_ARCH=amd64
ARG BUILD_VERSION=1.0.0

LABEL \
    io.hass.name="Sunny Island Detail" \
    io.hass.description="Live Sunny Island plant dashboard (Tesla pack + Enphase)" \
    io.hass.type="addon" \
    io.hass.version="${BUILD_VERSION}" \
    io.hass.arch="${BUILD_ARCH}" \
    org.opencontainers.image.title="Sunny Island Detail" \
    org.opencontainers.image.source="https://github.com/mobiletru/sunny_island_detail" \
    org.opencontainers.image.licenses="MIT"

ENV LANG=C.UTF-8

RUN set -eux; \
    for i in 1 2 3 4 5; do \
      apk add --no-cache nginx python3 ca-certificates curl && break; \
      echo "apk retry $i"; sleep $((i * 3)); \
    done

WORKDIR /opt/sunny_island_detail

COPY rootfs/www /opt/sunny_island_detail/www
COPY rootfs/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY scripts/render_config.py /opt/sunny_island_detail/render_config.py
COPY run.sh /run.sh

RUN sed -i 's/\r$//' /run.sh \
    && chmod a+x /run.sh \
    && mkdir -p /run/nginx /var/lib/nginx/tmp /var/log/nginx /tmp/nginx \
    && chown -R nginx:nginx /var/lib/nginx /var/log/nginx /run/nginx /tmp/nginx \
    && python3 -m py_compile /opt/sunny_island_detail/render_config.py \
    && nginx -t

EXPOSE 8097

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8097/health || exit 1

CMD ["/run.sh"]
