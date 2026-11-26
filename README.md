# DMS-Website

Static Doxyle marketing website for the DMS suite.

## Dokploy Integration deployment

Create a Compose service in the existing DMS Dokploy project with these settings:

| Setting | Value |
| --- | --- |
| GitHub account | `mudassirshoukat` |
| Repository | `DMS-Website` |
| Branch | `develop` |
| Compose path | `docker-compose.integration.yml` |
| Compose service | `dms-website` |
| Container port | `80` |
| Trigger | On push; enable Autodeploy for this Integration service |

Add the Integration hostname in Dokploy's Domains tab and route it to `dms-website:80`. Dokploy/Traefik should provide the public HTTPS route; the container only listens on its private service port. No persistent volumes are needed. The only environment variable is `VITE_DMS_PORTAL_URL` (see Sign in link below); the Integration compose file already sets it. This checkout deploys static HTML, CSS, JavaScript and images with Nginx; it does not require PHP.

Keep this service's deployment branch on `develop`. Only changes reaching that branch should deploy to Integration; the website's production domain should use a separately configured production service and branch.

### Sign in link

The website's Sign in links open the DMS app's `/login`. Set `VITE_DMS_PORTAL_URL` on the service to the app's address for that deployment, without `/login` (for example `https://app-dev.docluma.cloud`). The container writes it into `portal-config.js` when it starts (`docker/40-portal-url.sh`), and nginx serves that file uncached. No address is built into the pages: if the variable is not set, the Sign in links go nowhere instead of to another environment's app. `docker-compose.integration.yml` sets the Integration address.

### Request a demo form

The current form submits through FormSubmit's AJAX endpoint to `info@doxyle.com` (`formsubmit.co/ajax/...`). It does not call `src/demo-request.php`, and the repository has no PHP handler. The first real submission may require completing FormSubmit's one-time activation from the inbox for `info@doxyle.com`; successful sends depend on that third-party service being available. No SMTP credentials are stored in this repository or required by the website container.

## Dokploy Production deployment

Production uses a separate Compose service so Integration continues to deploy from `develop` independently.

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

The Production Compose file and site source currently live on `develop`; the `main` branch must receive the reviewed release before this Dokploy service can deploy. Promote the site through the normal GitHub review/merge process, then deploy `main`. Keep the existing Integration service on `develop` with `docker-compose.integration.yml`.
