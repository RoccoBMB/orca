/** Legacy relays used a fixed per-uid /tmp base when HOME exceeded sun_path (#10726); census must still find those sockets. */
import { branding } from '../../shared/branding'

export const SHORT_RELAY_SOCKET_DIR_PREFIX = `/tmp/${branding.homeDirectoryName}-relay-`
