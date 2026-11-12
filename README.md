# DMS-Website

Static Peaplexa marketing website for the DMS suite.

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

Add the Integration hostname in Dokploy's Domains tab and route it to `dms-website:80`. Dokploy/Traefik should provide the public HTTPS route; the container only listens on its private service port. No environment variables or persistent volumes are needed. This checkout deploys static HTML, CSS, JavaScript and images with Nginx; it does not require PHP.

Keep this service's deployment branch on `develop`. Only changes reaching that branch should deploy to Integration; the website's production domain should use a separately configured production service and branch.

### Request a demo form

The current form submits through FormSubmit's AJAX endpoint to `info@datagonomix.com` (`formsubmit.co/ajax/...`). It does not call `src/demo-request.php`, and the repository has no PHP handler. The first real submission may require completing FormSubmit's one-time activation from the inbox for `info@datagonomix.com`; successful sends depend on that third-party service being available. No SMTP credentials are stored in this repository or required by the website container.
