import type { CardTemplate } from '../../../../../../shared/workspace-cards/card-template-schema'

export const COMPACT_WORKSPACE_CARD_TEMPLATE: CardTemplate = {
  version: 1,
  facts: 1,
  frame: { singleLine: true, statusLane: true },
  root: {
    el: 'Row',
    props: { grow: true, align: 'center', gap: 'sm', marker: 'parent-content' },
    children: [
      { el: 'StatusLane' },
      {
        el: 'DetailsHover',
        props: { branchName: '=ws.identity', workspaceTitle: '=ws.title' },
        children: [
          {
            el: 'Row',
            props: { grow: true, align: 'center', gap: 'sm', marker: 'hover-trigger' },
            children: [
              { el: 'Title', props: { tooltip: false } },
              { el: 'RenameError', when: 'ws.hasRenameError' }
            ]
          }
        ]
      }
    ]
  }
}
