'use client'

import dynamic from 'next/dynamic'

const DynamicToaster = dynamic(
    () => import('./toast-provider'),
    { ssr: false }
)

export default DynamicToaster