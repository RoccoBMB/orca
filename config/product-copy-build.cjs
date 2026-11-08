const ts = require('typescript-api')
const { dirname, resolve } = require('node:path')
const MagicString = require('magic-string').default
const { branding } = require('./branding.cjs')

const ERROR_MESSAGE_ARGUMENTS = new Map([
  ['Error', 0],
  ['TypeError', 0],
  ['RangeError', 0],
  ['RuntimeClientError', 1],
  ['PluginCliError', 1],
  ['RemoteRuntimeClientError', 1],
  ['OrcadBundledRuntimeError', 0],
  ['AcpConnectionClosedError', 0]
])
const DISPLAY_FIELDS = new Set([
  'label',
  'title',
  'description',
  'summary',
  'message',
  'detail',
  'body',
  'why',
  'error',
  'reason'
])
const ACCESSIBLE_ATTRIBUTES = new Set([...DISPLAY_FIELDS, 'alt', 'aria-label', 'placeholder'])
const DISPLAY_CALLS = new Set([
  'console.log',
  'console.error',
  'console.warn',
  'console.info',
  'process.stdout.write',
  'process.stderr.write',
  'writeStdoutLine',
  'printPluginResult',
  'toast',
  'toast.error',
  'toast.success',
  'toast.warning',
  'toast.info',
  'toast.message'
])

function selectedCopy(text) {
  return text
    .replace(
      /(?<![A-Za-z0-9_./@:\\])Orca(?! (?:Computer Use|Terminal Host)\.app\b)(?![A-Za-z0-9_/@\\]|\.[A-Za-z])/g,
      branding.productName
    )
    .replace(
      /(?<![A-Za-z0-9_./@:\\])ORCA(?![A-Za-z0-9_/@\\]|\.[A-Za-z])/g,
      branding.productName.toUpperCase()
    )
    .replace(/(?<![A-Za-z0-9_./@:\\-])orca(?:-dev|-ide)?(?=\s|$|`)/g, (command) =>
      command === 'orca-dev'
        ? `${branding.cliCommand}-dev`
        : command === 'orca-ide'
          ? branding.linuxCliCommand
          : branding.cliCommand
    )
}

function ownsDisplayCopy(node, tree, errorNamespaces) {
  let owner = node.parent
  if (ts.isTemplateExpression(owner)) {
    owner = owner.parent
  } else if (ts.isTemplateSpan(owner)) {
    owner = owner.parent.parent
  }
  while (ts.isArrayLiteralExpression(owner)) {
    owner = owner.parent
  }
  if (ts.isCallExpression(owner)) {
    if (owner.expression.kind === ts.SyntaxKind.SuperKeyword) {
      let declaration = owner.parent
      while (declaration && !ts.isClassDeclaration(declaration)) declaration = declaration.parent
      const base = declaration?.heritageClauses
        ?.find((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)
        ?.types[0]?.expression.getText(tree)
      const index = ERROR_MESSAGE_ARGUMENTS.get(base)
      const value = ts.isTemplateSpan(node.parent)
        ? node.parent.parent
        : ts.isTemplateExpression(node.parent)
          ? node.parent
          : node
      return index !== undefined && owner.arguments[index] === value
    }
    return DISPLAY_CALLS.has(owner.expression.getText(tree))
  }
  if (ts.isNewExpression(owner)) {
    const expression = owner.expression
    const name = ts.isIdentifier(expression)
      ? expression.text
      : ts.isPropertyAccessExpression(expression) &&
          errorNamespaces.has(expression.expression.getText(tree))
        ? expression.name.text
        : null
    const index = ERROR_MESSAGE_ARGUMENTS.get(name)
    const value = ts.isTemplateSpan(node.parent)
      ? node.parent.parent
      : ts.isTemplateExpression(node.parent)
        ? node.parent
        : node
    return index !== undefined && owner.arguments?.[index] === value
  }
  if (ts.isPropertyAssignment(owner)) {
    return DISPLAY_FIELDS.has(owner.name.getText(tree).replace(/^['"]|['"]$/g, ''))
  }
  if (ts.isJsxAttribute(owner)) {
    return ACCESSIBLE_ATTRIBUTES.has(owner.name.getText(tree))
  }
  if (ts.isJsxExpression(owner) && ts.isJsxAttribute(owner.parent)) {
    return ACCESSIBLE_ATTRIBUTES.has(owner.parent.name.getText(tree))
  }
  return ts.isJsxText(node)
}

// Only authored display fields and Error message arguments; data and interpolated values are opaque.
function productCopyBuild(source, filename) {
  if (branding.productName === 'Orca' || !/\b(?:Orca|ORCA|orca)\b/.test(source)) {
    return null
  }
  if (
    /(?:\.test[.-]|\.spec\.|\.fixture\.|test-fixture|\/fixtures\/|\/resources\/plugins\/)/.test(
      filename
    )
  ) {
    return null
  }
  const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true)
  const errorNamespaces = new Set()
  function collectErrorImports(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText(tree) === 'require'
    ) {
      const module = node.initializer.arguments[0]
      if (
        module &&
        ts.isStringLiteral(module) &&
        /(?:^|\/)(?:runtime-client|plugin-cli-approval|remote-runtime-client-error|orcad-bundled-runtime|acp-agent-connection)(?:\.js)?$/.test(
          module.text
        )
      ) {
        errorNamespaces.add(node.name.text)
      }
      if (
        module &&
        ts.isStringLiteral(module) &&
        module.text.startsWith('.') &&
        /\/cli\/runtime\/types$/.test(
          resolve(dirname(filename), module.text)
            .replace(/\\/g, '/')
            .replace(/\.(?:js|ts)$/, '')
        )
      ) {
        errorNamespaces.add(node.name.text)
      }
    }
    ts.forEachChild(node, collectErrorImports)
  }
  collectErrorImports(tree)
  const output = new MagicString(source)
  const changes = []
  function visit(node) {
    if (
      (ts.isStringLiteralLike(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node) ||
        ts.isJsxText(node)) &&
      ownsDisplayCopy(node, tree, errorNamespaces)
    ) {
      const before = node.getText(tree)
      // Embedded programs and external paths are not display templates.
      if (/\n/.test(node.text ?? '') || /^(?:https?:|[A-Za-z]:\\|~?\/)/.test(node.text ?? '')) {
        return
      }
      const after = selectedCopy(before)
      if (after !== before) {
        const start = node.getStart(tree)
        output.overwrite(start, node.end, after)
        changes.push({
          file: filename,
          line: tree.getLineAndCharacterOfPosition(start).line + 1,
          before,
          after
        })
      }
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
  return changes.length
    ? {
        code: output.toString(),
        map: output.generateMap({ hires: true, source: filename, includeContent: true }),
        changes
      }
    : null
}

module.exports = { productCopyBuild }
