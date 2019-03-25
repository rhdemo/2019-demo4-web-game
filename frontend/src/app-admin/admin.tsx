import { h, render } from 'preact'
import { AdminView } from '@app/app-admin/admin.view'

const mountNode = document.getElementById('root') as HTMLElement
render(<AdminView />, mountNode, mountNode.lastChild as HTMLElement)
