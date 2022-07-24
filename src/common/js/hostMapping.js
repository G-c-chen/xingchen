const mapping = {
    default: {
        development: 'https://wecat.ncrm.vip',
        production: 'https://wecat.ncrm.vip',
    },
}

export default function getApiHost(flag) {
    let env = window.location.origin.indexOf('home-nl.feelsowarm.com') > -1 ? 'production' : 'production'
    return mapping[flag || 'default'][env]
}
