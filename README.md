# DMS-Website

Static Doxyle marketing website for the DMS suite.

## Dokploy Development deployment

Create a Compose service in the existing DMS Dokploy project with these settings:

| Setting | Value |
| --- | --- |
| GitHub account | `mudassirshoukat` |
| Repository | `DMS-Website` |
| Branch | `develop` |
| Compose path | `./docker-compose.development.yml` |
| Compose service | `dms-website` |
| Container port | `80` |
| Trigger | On push; enable Autodeploy for this Development service |
| Domain | `https://dev.doxyle.com` routed to `dms-website:80` |

Set `VITE_DMS_PORTAL_URL=https://app-stage.doxyle.com` in the Development service's Environment tab before deploying. Configure HTTPS for `dev.doxyle.com` in Dokploy. No persistent volumes are needed. This checkout deploys static HTML, CSS, JavaScript and images with Nginx; it does not require PHP.

Keep this service's deployment branch on `develop`; Production uses a separate service and branch.

### Sign in link

The website's Sign in links open the DMS app's `/login`. Set `VITE_DMS_PORTAL_URL` to the appropriate app origin, without `/login`, in each Dokploy service. The container writes it into `portal-config.js` when it starts (`docker/40-portal-url.sh`), and nginx serves that file uncached. Both Compose files require the variable. When pages are served directly outside the container, the checked-in config has no app URL.

### Request a demo form

The current form submits through FormSubmit's AJAX endpoint to `info@doxyle.com` (`formsubmit.co/ajax/...`). It does not call `src/demo-request.php`, and the repository has no PHP handler. The first real submission may require completing FormSubmit's one-time activation from the inbox for `info@doxyle.com`; successful sends depend on that third-party service being available. No SMTP credentials are stored in this repository or required by the website container.

## Dokploy Production deployment

Production uses a separate Compose service so Development continues to deploy from `develop` independently.

| Setting | Value |
| --- | --- |
| GitHub account | `mudassirshoukat` |
| Repository | `DMS-Website` |
| Branch | `main` |
| Compose path | `./docker-compose.production.yml` |
| Compose service | `dms-website` |
| Container port | `80` |
| Trigger | On push; enable Autodeploy for this Production service |
| Domain | `https://doxyle.com` routed to `dms-website:80` |

Set `VITE_DMS_PORTAL_URL=https://app.doxyle.com` in this Dokploy service's Environment tab. The container writes that value into `portal-config.js` at startup, so the website's Sign in links open the Production app. No secrets or persistent volumes are needed.

The `main` branch must contain the reviewed website release and Production Compose file before this Dokploy service can deploy. Keep the existing Development service on `develop` with `docker-compose.development.yml`.
