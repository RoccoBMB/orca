import upstreamLogo from '../../../../resources/logo.svg'
import maestroLogo from '../../../../resources/maestro/logo.svg'
import maestroIcon from '../../../../resources/maestro/icon.png?url'
import { branding } from '../../../shared/branding'

export const productLogo = branding.productName === 'Maestro' ? maestroLogo : upstreamLogo
export const productIcon = maestroIcon
