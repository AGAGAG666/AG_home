type SocialLink = {
  label: string
  link: string
}

type Project = {
  name: string
  link: string
}

type Blog = {
  name: string
  link: string
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'Telegram',
    link: 'https://t.me/ECMML',
  },
  {
    label: 'Discord',
    link: 'https://discord.gg/fDDdbSp6Ga',
  },
  {
    label: 'Twitter(X)',
    link: 'https://x.com/AGAGAG666_',
  },
]

export const PROJECTS: Project[] = [
  {
    name: '2fa 验证',
    link: '/2fa',
  },
  {
    name: 'MikuTap',
    link: 'https://mikutap.loveag.dpdns.org',
  },
  {
    name: '卡网',
    link: 'https://816.i188.net/shop/ECMML',
  },
  {
    name: 'TEMP_EC',
    link: 'https://mail.ec520.dpdns.org/',
  },
]

export const EMAIL = 'ag520@loveag.dpdns.org'

export const BLOGS: Blog[] = [
  {
    name: '博客',
    link: '#',
  },
]
